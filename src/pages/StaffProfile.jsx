import { useState } from 'react';
import { Loader2, LogOut, Check, KeyRound, Mail, ShieldCheck, Gift, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, Avatar } from '../components/ui';

// Shared profile screen for teacher + admin.
export default function StaffProfile() {
  const { profile, session, refreshProfile, signOut } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);
  const [f, setF] = useState({ full_name: profile.full_name ?? '', phone: profile.phone ?? '' });
  const [pwd, setPwd] = useState('');

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ full_name: f.full_name, phone: f.phone }).eq('id', profile.id);
    setBusy(false);
    if (error) return toast(error.message, 'error');
    await refreshProfile();
    toast('Profile updated');
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwd.length < 6) return toast('Password must be at least 6 characters', 'error');
    setPwdBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setPwdBusy(false);
    if (error) return toast(error.message, 'error');
    setPwd('');
    toast('Password updated');
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile.full_name} url={profile.avatar_url} size="w-16 h-16" />
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{profile.full_name}</h2>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 capitalize ${
              profile.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
            }`}><ShieldCheck className="w-3.5 h-3.5" /> {profile.role}</span>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Mail className="w-4 h-4" /> {session?.user?.email}</p>

        {profile.referral_code && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Gift className="w-4 h-4 text-brand-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Your referral code</p>
                <p className="font-display text-lg font-bold tracking-wider text-slate-900">{profile.referral_code}</p>
              </div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(profile.referral_code); toast('Referral code copied'); }}
              className="btn-secondary !py-2 !px-3 text-xs shrink-0"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">Students you add are auto-linked to this code.</p>
      </Card>

      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">Edit details</h3>
        <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="full_name">Full name</label>
            <input id="full_name" className="input" value={f.full_name} onChange={e => setF(x => ({ ...x, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input id="phone" className="input" value={f.phone} onChange={e => setF(x => ({ ...x, phone: e.target.value }))} />
          </div>
          <button type="submit" disabled={busy} className="btn-primary sm:col-span-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save changes
          </button>
        </form>
      </Card>

      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><KeyRound className="w-5 h-5 text-slate-500" /> Change password</h3>
        <form onSubmit={changePassword} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input type="password" className="input flex-1" placeholder="New password (min 6 chars)" value={pwd} onChange={e => setPwd(e.target.value)} />
          <button type="submit" disabled={pwdBusy || !pwd} className="btn-secondary">
            {pwdBusy && <Loader2 className="w-4 h-4 animate-spin" />} Update
          </button>
        </form>
      </Card>

      <button onClick={signOut} className="btn-secondary w-full text-red-600 hover:bg-red-50">
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
}
