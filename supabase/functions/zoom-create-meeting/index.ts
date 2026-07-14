// zoom-create-meeting
// Called by admin/teacher React after a session row exists.
// Body: { session_id }
// Creates a Zoom scheduled meeting (cloud auto-record, registration on)
// and writes zoom_* fields back to the session. Returns the join URL.
//
// Deploy: supabase functions deploy zoom-create-meeting

import { cors, svc, zoomFetch } from '../_shared/zoom.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { session_id } = await req.json();
    if (!session_id) throw new Error('session_id required');

    const db = svc();
    const { data: session, error } = await db
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .maybeSingle();
    if (error) throw new Error(`DB error: ${error.message}`);
    if (!session) throw new Error(`session not found for id ${session_id}`);

    // Slot lock: never create a second meeting. Return the existing one.
    if (session.zoom_meeting_id) {
      return new Response(
        JSON.stringify({ join_url: session.zoom_join_url, meeting_id: session.zoom_meeting_id, existing: true }),
        { headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    // scheduled_at is an absolute UTC instant. Send it to Zoom AS UTC (with the
    // trailing "Z") and set timezone 'UTC' — Zoom then shows every registrant the
    // meeting in THEIR OWN local timezone. The old code added a hardcoded +5:30
    // IST offset, which showed the wrong wall-clock time to students in the USA,
    // Germany, or anywhere outside India.
    const baseUtc = session.scheduled_at ? new Date(session.scheduled_at) : new Date(Date.now() + 3600 * 1000);
    const startUtc = baseUtc.toISOString().slice(0, 19) + 'Z';

    const userId = Deno.env.get('ZOOM_USER_ID')!;
    const meeting = await zoomFetch(`/users/${userId}/meetings`, {
      method: 'POST',
      body: JSON.stringify({
        topic: session.title,
        type: 2, // scheduled
        start_time: startUtc, // absolute UTC — Zoom localizes per registrant
        duration: session.duration_minutes ?? 60,
        timezone: 'UTC',
        settings: {
          approval_type: 0,        // auto-approve registrants → identity-bound join links
          registration_type: 1,
          waiting_room: false,
          join_before_host: false,
          auto_recording: 'cloud',
          meeting_authentication: false,
        },
      }),
    });

    // Race guard: only claim the slot if it's still empty. Two concurrent
    // requests both pass the check above; the conditional update makes exactly
    // one win. The loser deletes its orphan Zoom meeting and returns the winner's.
    const { data: claimed } = await db.from('sessions').update({
      zoom_meeting_id: String(meeting.id),
      zoom_join_url: meeting.join_url,
      zoom_start_url: meeting.start_url, // host only
      // Also seed the editable "manual join link" field so the auto-created link
      // shows in the UI immediately and can be overridden later if needed.
      zoom_link: meeting.join_url,
    }).eq('id', session_id).is('zoom_meeting_id', null).select('id');

    if (!claimed?.length) {
      await zoomFetch(`/meetings/${meeting.id}`, { method: 'DELETE' }).catch(() => {});
      const { data: winner } = await db.from('sessions')
        .select('zoom_meeting_id, zoom_join_url').eq('id', session_id).single();
      return new Response(
        JSON.stringify({ join_url: winner?.zoom_join_url, meeting_id: winner?.zoom_meeting_id, existing: true }),
        { headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ join_url: meeting.join_url, meeting_id: String(meeting.id) }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
