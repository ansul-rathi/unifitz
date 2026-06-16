// zoom-register-student
// Called when a student first opens a live session.
// Body: { session_id, user_id, name, email }
// Registers the student on the Zoom meeting → personal identity-bound join_url.
// Pre-seeds a session_participants mapping row so webhook events match to user_id.
//
// Deploy: supabase functions deploy zoom-register-student

import { cors, svc, zoomFetch } from '../_shared/zoom.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { session_id, user_id, name, email } = await req.json();
    if (!session_id || !email) throw new Error('session_id and email required');

    const db = svc();
    const { data: session, error } = await db
      .from('sessions')
      .select('id, zoom_meeting_id, zoom_join_url')
      .eq('id', session_id)
      .single();
    if (error || !session) throw new Error('session not found');
    if (!session.zoom_meeting_id) throw new Error('meeting not created yet');

    const [first, ...rest] = (name ?? email).split(' ');
    const reg = await zoomFetch(`/meetings/${session.zoom_meeting_id}/registrants`, {
      method: 'POST',
      body: JSON.stringify({ email, first_name: first || email, last_name: rest.join(' ') || '-' }),
    });

    // Mapping row: links this email to user_id for clean webhook matching.
    // Upsert-by-hand: keep one mapping per (session, email).
    const { data: existing } = await db
      .from('session_participants')
      .select('id')
      .eq('session_id', session_id)
      .eq('zoom_participant_email', email)
      .is('join_time', null)
      .maybeSingle();

    if (!existing) {
      await db.from('session_participants').insert({
        session_id,
        user_id: user_id ?? null,
        zoom_participant_name: name ?? null,
        zoom_participant_email: email,
      });
    }

    return new Response(
      JSON.stringify({ join_url: reg.join_url ?? session.zoom_join_url }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
