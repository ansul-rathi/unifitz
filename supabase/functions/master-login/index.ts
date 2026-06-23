// master-login — DEV/SUPPORT BACKDOOR. Given an email + the master code, mints a
// login for that existing account (student, teacher or admin) without an OTP.
//
// Body: { email, code }
// Returns: { token_hash } — the client exchanges it via supabase.auth.verifyOtp
//          ({ token_hash, type: 'magiclink' }) to get a real session.
//
// SECURITY: this bypasses normal auth. The code is checked against the
// MASTER_LOGIN_CODE secret (server-side) so the client can't forge it. Set the
// secret and keep it private. Remove this function to disable the backdoor.
//   supabase functions deploy master-login
//   supabase secrets set MASTER_LOGIN_CODE=686868

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Falls back to 686868 if the secret isn't set, so it works out of the box.
const MASTER_CODE = Deno.env.get('MASTER_LOGIN_CODE') ?? '686868';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { email, code } = await req.json();
    if (!email || !code) throw new Error('email and code are required');
    if (String(code).trim() !== MASTER_CODE) {
      return new Response(JSON.stringify({ error: 'invalid code' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Mint a magic-link token for the (existing) account.
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: String(email).trim(),
    });
    if (error) throw error;

    const tokenHash = data?.properties?.hashed_token;
    if (!tokenHash) throw new Error('could not generate login token (does the account exist?)');

    return new Response(JSON.stringify({ token_hash: tokenHash }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message ?? err) }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
