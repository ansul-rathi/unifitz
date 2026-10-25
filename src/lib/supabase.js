import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly in dev instead of mysterious network errors.
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env');
}

// During the build-time prerender (import.meta.env.SSR) no network client is
// needed — data calls only happen in effects, which never run on the server —
// so an inert stub stands in. Any accidental render-time call fails loudly.
export const supabase = import.meta.env.SSR
  ? new Proxy({}, { get: (_, prop) => { throw new Error(`supabase.${String(prop)} called during prerender — move it into an effect`); } })
  : createClient(url, anonKey, {
    auth: {
      detectSessionInUrl: true,  // complete email-link sign-ins arriving with tokens in the URL
      persistSession: true,
      autoRefreshToken: true,
    },
  });
