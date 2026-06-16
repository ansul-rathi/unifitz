import { useState } from 'react';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

// Teacher/admin: create a student account, auto-linked to the creator's referral.
export default function AddStudentModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-student', { body: f });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast(`${f.full_name} added — linked to your referrals`);
      setF({ full_name: '', email: '', phone: '', password: '' });
      onClose();
      onCreated?.();
    } catch (err) {
      toast(err.message || 'Could not create student', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} className="relative z-[80]">
      <DialogBackdrop transition className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0" />
      <div className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
        <DialogPanel transition className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 md:p-6 shadow-2xl transition duration-200 data-[closed]:translate-y-8 data-[closed]:opacity-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand-500" /> Add student</h3>
            <button onClick={() => !busy && onClose()} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-slate-500 mt-1">They'll be linked to your referrals automatically.</p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input required placeholder="Full name" className="input" value={f.full_name} onChange={e => setF(x => ({ ...x, full_name: e.target.value }))} />
            <input required type="email" placeholder="Email" className="input" value={f.email} onChange={e => setF(x => ({ ...x, email: e.target.value }))} />
            <input type="tel" placeholder="Phone (optional)" className="input" value={f.phone} onChange={e => setF(x => ({ ...x, phone: e.target.value }))} />
            <input required type="text" placeholder="Temporary password (min 6)" className="input" value={f.password} onChange={e => setF(x => ({ ...x, password: e.target.value }))} />
            <p className="text-xs text-slate-400">Share this password with the student — they can change it after login.</p>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Create student
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
