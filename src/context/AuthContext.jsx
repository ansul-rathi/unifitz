import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async userId => {
    // maybeSingle: a not-yet-created row returns null instead of erroring, so a
    // brand-new signup doesn't get stuck on the "Loading profile…" spinner.
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data ?? null);
    return data;
  }, []);

  // Merge known-good fields into the cached profile without a refetch. Used after
  // onboarding so the /app guard sees onboarding_complete=true immediately,
  // instead of bouncing back when a replica-lagged refetch still reads false.
  const patchProfile = useCallback(p => setProfile(prev => ({ ...prev, ...p })), []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) await loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) await loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut, patchProfile, refreshProfile: () => session && loadProfile(session.user.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
