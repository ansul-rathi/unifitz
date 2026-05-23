import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Supabase environment variables are missing! ' +
    'Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your production environment variables (e.g. Vercel/Netlify Dashboard).'
  );
}

// Initialize defensively to avoid throwing a top-level crash on import, which makes the page blank.
// Instead, throw a descriptive runtime error if a query is actually attempted.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
      get(_, prop) {
        return () => {
          throw new Error(
            `Supabase client operation '${String(prop)}' failed because REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY is missing/empty in production. Please set these environment variables in your hosting settings.`
          );
        };
      }
    });

