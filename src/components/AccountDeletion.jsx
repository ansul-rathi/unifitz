import { useState } from 'react';
import { Loader2, Trash2, HeartHandshake } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fmtDate } from '../lib/datetime';

// Member self-service account deletion (App Store / Play requirement).
// request_account_deletion starts a 30-day grace period; the member is signed
// out and can come back any time before the date to keep the account.
// After 30 days pg_cron purge_deleted_accounts() deletes everything.

const dueAt = p => (p?.deletion_requested_at ? new Date(new Date(p.deletion_requested_at).getTime() + 30 * 86400000) : null);

export function DeletionBanner() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const due = dueAt(profile);
  if (!due) return null;

  async function keep() {
    setBusy(true);
    const { error } = await supabase.rpc('cancel_account_deletion');
    setBusy(false);
    if (error) return toast(error.message, 'error');
    await refreshProfile();
    toast('Welcome back — your account is safe');
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <p className="font-bold text-red-700">Account scheduled for deletion</p>
        <p className="text-sm text-red-600/80">Everything will be permanently deleted on {fmtDate(due, { withYear: true })}.</p>
      </div>
      <button onClick={keep} disabled={busy} className="btn-primary !py-2 !px-4 text-sm">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />} Keep my account
      </button>
    </div>
  );
}

export function DeleteAccountButton() {
  const { profile, signOut } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (dueAt(profile)) return null;

  async function request() {
    if (!confirm('Delete your account?\n\nYour profile, classes, check-ins, progress and payment history will be permanently deleted after 30 days. Sign in any time before then to keep your account.')) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('request_account_deletion');
    setBusy(false);
    if (error) return toast(error.message, 'error');
    alert(`Your account will be deleted on ${fmtDate(data, { withYear: true })}. You'll be signed out now.`);
    await signOut();
  }

  return (
    <button onClick={request} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 text-sm font-medium">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete account
    </button>
  );
}
