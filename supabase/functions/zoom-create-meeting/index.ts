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
      .select('id, title, scheduled_at, duration_minutes, zoom_meeting_id, zoom_join_url')
      .eq('id', session_id)
      .single();
    if (error || !session) throw new Error('session not found');

    // Slot lock: never create a second meeting. Return the existing one.
    if (session.zoom_meeting_id) {
      return new Response(
        JSON.stringify({ join_url: session.zoom_join_url, meeting_id: session.zoom_meeting_id, existing: true }),
        { headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    // Zoom rule: a start_time WITH a "Z" is treated as GMT and the timezone
    // field is ignored. We instead send the naive local wall-clock (no Z) and
    // set timezone explicitly, so Zoom shows the exact IST time the teacher picked.
    // scheduled_at is stored as UTC; shift +5:30 (IST, no DST) to get IST wall time.
    const utc = new Date(session.scheduled_at);
    const istLocal = new Date(utc.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 19);

    const userId = Deno.env.get('ZOOM_USER_ID')!;
    const meeting = await zoomFetch(`/users/${userId}/meetings`, {
      method: 'POST',
      body: JSON.stringify({
        topic: session.title,
        type: 2, // scheduled
        start_time: istLocal, // naive local time, no Z
        duration: session.duration_minutes ?? 60,
        timezone: 'Asia/Kolkata',
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

    await db.from('sessions').update({
      zoom_meeting_id: String(meeting.id),
      zoom_join_url: meeting.join_url,
      zoom_start_url: meeting.start_url, // host only
    }).eq('id', session_id);

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
