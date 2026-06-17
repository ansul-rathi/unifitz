// Client-side wrappers for the Zoom Edge Functions.
import { supabase } from './supabase';

// Admin/teacher: create the Zoom meeting for a session row that already exists.
export async function createZoomMeeting(sessionId) {
  const { data, error } = await supabase.functions.invoke('zoom-create-meeting', {
    body: { session_id: sessionId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data; // { join_url, meeting_id }
}

// Student: register on first open → personal identity-bound join URL.
export async function registerForSession(session, profile, email) {
  const { data, error } = await supabase.functions.invoke('zoom-register-student', {
    body: { session_id: session.id, user_id: profile.id, name: profile.full_name, email },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.join_url ?? session.zoom_join_url ?? session.zoom_link;
}

// Teacher/admin: AI-generate a poster from title + description + extra prompt.
export async function generateSessionImage(sessionId, prompt) {
  const { data, error } = await supabase.functions.invoke('generate-session-image', {
    body: { session_id: sessionId, prompt },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.poster_url;
}

// Admin: AI-generate a banner for a whole series.
export async function generateSeriesImage(challengeId, prompt) {
  const { data, error } = await supabase.functions.invoke('generate-series-image', {
    body: { challenge_id: challengeId, prompt },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.poster_url;
}
