// zoom-webhook — single public receiver for all Zoom events.
// MUST be deployed with --no-verify-jwt (Zoom can't send a Supabase JWT):
//   supabase functions deploy zoom-webhook --no-verify-jwt
//
// Handles: endpoint.url_validation, meeting.participant_joined,
// meeting.participant_left, meeting.ended, recording.completed.
// Responds within 3s (Zoom requirement) — work here is light upserts.

import { cors, svc, hmacHex } from '../_shared/zoom.ts';

const SECRET = Deno.env.get('ZOOM_WEBHOOK_SECRET_TOKEN')!;

function minutesBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));
}

// Resolve a session by Zoom meeting id (events carry the numeric id as string).
async function findSession(db: ReturnType<typeof svc>, meetingId: string) {
  const { data } = await db.from('sessions').select('*').eq('zoom_meeting_id', String(meetingId)).maybeSingle();
  return data;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const raw = await req.text();
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }

  // 1) URL validation handshake — must echo encrypted plainToken.
  if (payload.event === 'endpoint.url_validation') {
    const plainToken = payload.payload?.plainToken;
    const encryptedToken = await hmacHex(plainToken, SECRET);
    return new Response(JSON.stringify({ plainToken, encryptedToken }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2) Verify signature on every real event.
  const ts = req.headers.get('x-zm-request-timestamp') ?? '';
  const sig = req.headers.get('x-zm-signature') ?? '';
  const expected = `v0=${await hmacHex(`v0:${ts}:${raw}`, SECRET)}`;
  if (sig !== expected) return new Response('invalid signature', { status: 401 });

  const db = svc();
  const event = payload.event as string;
  const obj = payload.payload?.object ?? {};

  try {
    if (event === 'meeting.started') {
      const session = await findSession(db, obj.id);
      if (session) {
        await db.from('sessions').update({ started: true }).eq('id', session.id);
      }
    }

    else if (event === 'meeting.participant_joined') {
      const session = await findSession(db, obj.id);
      if (session) {
        const p = obj.participant ?? {};
        const email = p.email || null;

        // Match to user_id via a registration mapping row (zoom-register-student).
        let userId: string | null = null;
        if (email) {
          const { data: map } = await db.from('session_participants')
            .select('user_id').eq('session_id', session.id).eq('zoom_participant_email', email)
            .not('user_id', 'is', null).limit(1).maybeSingle();
          userId = map?.user_id ?? null;
        }

        // Dedupe: ignore repeated join for same participant_uuid + join_time.
        const { data: dupe } = await db.from('session_participants')
          .select('id').eq('session_id', session.id)
          .eq('zoom_participant_uuid', p.participant_uuid ?? '')
          .eq('join_time', p.join_time).maybeSingle();

        if (!dupe) {
          // Reuse an empty registration row if one is waiting, else insert.
          const { data: reg } = await db.from('session_participants')
            .select('id').eq('session_id', session.id)
            .eq('zoom_participant_email', email ?? '___none___')
            .is('join_time', null).limit(1).maybeSingle();

          if (reg) {
            await db.from('session_participants').update({
              join_time: p.join_time, zoom_participant_uuid: p.participant_uuid,
              zoom_participant_name: p.user_name, user_id: userId,
            }).eq('id', reg.id);
          } else {
            await db.from('session_participants').insert({
              session_id: session.id, user_id: userId,
              zoom_participant_name: p.user_name, zoom_participant_email: email,
              zoom_participant_uuid: p.participant_uuid, join_time: p.join_time,
            });
          }
        }
      }
    }

    else if (event === 'meeting.participant_left') {
      const session = await findSession(db, obj.id);
      if (session) {
        const p = obj.participant ?? {};
        // Find the open segment for this participant (join set, leave null).
        const { data: open } = await db.from('session_participants')
          .select('id, join_time').eq('session_id', session.id)
          .eq('zoom_participant_uuid', p.participant_uuid ?? '')
          .is('leave_time', null).order('join_time', { ascending: false }).limit(1).maybeSingle();
        if (open) {
          await db.from('session_participants').update({
            leave_time: p.leave_time,
            total_minutes: minutesBetween(open.join_time, p.leave_time),
          }).eq('id', open.id);
        }
      }
    }

    else if (event === 'meeting.ended') {
      const session = await findSession(db, obj.id);
      if (session) {
        const sessionMinutes = obj.start_time && obj.end_time
          ? minutesBetween(obj.start_time, obj.end_time)
          : (session.duration_minutes ?? 60);

        // SUM minutes per matched user across all segments.
        const { data: parts } = await db.from('session_participants')
          .select('user_id, total_minutes').eq('session_id', session.id).not('user_id', 'is', null);

        const byUser = new Map<string, number>();
        for (const row of parts ?? []) {
          byUser.set(row.user_id, (byUser.get(row.user_id) ?? 0) + (row.total_minutes ?? 0));
        }

        // Per-series attendance threshold (default 75) — no longer hardcoded.
        let threshold = 75;
        if (session.challenge_id) {
          const { data: ch } = await db.from('challenges')
            .select('attendance_threshold').eq('id', session.challenge_id).maybeSingle();
          if (ch?.attendance_threshold != null) threshold = ch.attendance_threshold;
        }

        for (const [user_id, mins] of byUser) {
          const pct = sessionMinutes ? Math.round((mins / sessionMinutes) * 100) : 0;
          await db.from('attendance').upsert({
            session_id: session.id, user_id,
            attended: pct >= threshold,
            attended_minutes: mins, session_minutes: sessionMinutes,
            attendance_pct: pct, source: 'zoom', marked_by: null,
          }, { onConflict: 'session_id,user_id' });

          // Self-heal: a matched participant who joined the live class is a real
          // participant — make sure they're enrolled so series counts stay correct.
          if (session.challenge_id) {
            await db.from('enrollments')
              .upsert({ user_id, challenge_id: session.challenge_id }, { onConflict: 'user_id,challenge_id' });
          }
        }
        // attendance trigger on_attendance_marked handles Day-7 referral check.
        // Ended → mark complete + flag the recording as processing until it lands.
        await db.from('sessions').update({
          completed: true, is_live_next: false, started: true,
          recording_status: session.recording_link ? session.recording_status : 'processing',
          zoom_meeting_uuid: obj.uuid ?? session.zoom_meeting_uuid,
        }).eq('id', session.id);
      }
    }

    else if (event === 'recording.completed') {
      const session = await findSession(db, obj.id);
      if (session) {
        const files = obj.recording_files ?? [];
        const best = files.find((f: any) => f.recording_type === 'shared_screen_with_speaker_view' && f.file_type === 'MP4')
          ?? files.find((f: any) => f.file_type === 'MP4')
          ?? files[0];
        if (best) {
          await db.from('sessions').update({
            recording_link: best.play_url ?? best.share_url ?? obj.share_url,
            recording_password: obj.password ?? obj.recording_play_passcode ?? null,
            recording_status: 'available',
            session_type: 'recording',
          }).eq('id', session.id);
        }
      }
    }
  } catch (err) {
    console.error('zoom-webhook error', event, err);
    // Persist the failure so attendance/lifecycle gaps are visible to admins
    // (webhook_events table, migration_series_hardening.sql). Still return
    // 2xx so Zoom doesn't endlessly retry.
    await db.from('webhook_events').insert({
      source: 'zoom', event_type: event, status: 'error',
      error: String((err as Error)?.message ?? err), payload,
    }).then(({ error: logErr }) => { if (logErr) console.error('webhook_events insert failed', logErr); });
  }

  return new Response(null, { status: 204 });
});
