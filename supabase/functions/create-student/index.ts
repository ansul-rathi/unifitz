// create-student — teacher/admin creates a client account. The new student is
// auto-attributed to the creator's referral (referred_by + a referrals row),
// handled by the existing on_auth_user_created trigger via the referral_code.
//
// Body: { full_name, email, phone, password }
// Caller identified via Authorization JWT; must be teacher or admin.
// Deploy: supabase functions deploy create-student

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { full_name, email, phone, password } = await req.json();
    if (!full_name || !email || !password) throw new Error('full_name, email and password are required');
    if (String(password).length < 6) throw new Error('password must be at least 6 characters');

    // Identify caller + check role/ referral code.
    const authed = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await authed.auth.getUser();
    if (!user) throw new Error('not authenticated');

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data: caller } = await admin.from('profiles').select('role, referral_code, full_name').eq('id', user.id).single();
    if (!caller || !['teacher', 'admin'].includes(caller.role)) throw new Error('only teachers and admins can add students');

    // Create the auth user (email pre-confirmed so they can log in immediately).
    // referral_code in metadata → trigger links referred_by + inserts referrals row.
    const { data: created, error } = await admin.auth.admin.createUser({
      email: String(email).trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: String(full_name).trim(),
        phone: phone ? String(phone).trim() : null,
        referral_code: caller.referral_code ?? '',
      },
    });
    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, user_id: created.user?.id, referred_by: caller.full_name }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
