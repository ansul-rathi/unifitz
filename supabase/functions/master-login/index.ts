// master-login — DEV/SUPPORT BACKDOOR. Given an email + the master code, mints a
// login for that existing account (student, teacher or admin) without an OTP.
//
// Body: { email, code }
// Returns: { token_hash } — the client exchanges it via supabase.auth.verifyOtp
//          ({ token_hash, type: 'magiclink' }) to get a real session.
//
// SECURITY: this bypasses normal auth. The code is checked against the
// MASTER_LOGIN_CODE secret (server-side) so the client can't forge it. If the
// secret is unset the backdoor is DISABLED (403). Keep the secret private and
// rotate it; delete this function to remove the backdoor entirely.
//   supabase secrets set MASTER_LOGIN_CODE=<private-code>
//   supabase functions deploy master-login

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// No insecure default — if MASTER_LOGIN_CODE is unset, the backdoor is DISABLED.
// Set a private secret to enable it: supabase secrets set MASTER_LOGIN_CODE=…
const MASTER_CODE = Deno.env.get('MASTER_LOGIN_CODE');

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { email, code } = await req.json();
    if (!email || !code) throw new Error('email and code are required');
    if (!MASTER_CODE) {
      return new Response(JSON.stringify({ error: 'master login disabled' }), {
        status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
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
