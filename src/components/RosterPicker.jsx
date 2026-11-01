import { useCallback, useEffect, useState } from 'react';
import { X, Loader2, Search, UserPlus, Check, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Avatar, EmptyState } from './ui';
import AddStudentModal from './AddStudentModal';

// Pick the regular students of a live class. Candidates come from the
// live_class_candidates RPC (a teacher's own students; any client for admins);
// saving replaces the roster via set_live_class_roster.
export default function RosterPicker({ challengeId, onClose, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [picked, setPicked] = useState(new Set());
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('live_class_candidates', { p_challenge: challengeId });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return null; }
    setPeople(data ?? []);
    return data ?? [];
  }, [challengeId, toast]);

  // Start from the current roster.
  useEffect(() => {
    load().then(rows => rows && setPicked(new Set(rows.filter(p => p.is_member).map(p => p.user_id))));
  }, [load]);

  async function onStudentCreated(id) {
    await load();
    if (id) setPicked(s => new Set(s).add(id));
  }

  function toggle(id) {
    setPicked(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    const { error } = await supabase.rpc('set_live_class_roster', { p_challenge: challengeId, p_users: [...picked] });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast(`Roster saved — ${picked.size} student${picked.size === 1 ? '' : 's'}`);
    onSaved?.();
    onClose();
  }

  const term = q.trim().toLowerCase();
  const shown = term ? people.filter(p => p.full_name.toLowerCase().includes(term)) : people;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 md:p-6 max-h-[85vh] flex flex-col animate-fade-up">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-brand-500" /> Class students</h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-500 mt-1">Pick who attends this class regularly. Only they see it and get attendance, remarks and rating prompts.</p>

        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search students" className="input !py-2 !pl-9 text-sm" />
          </div>
          <button type="button" onClick={() => setAddOpen(true)} className="btn-secondary !py-2 !px-3 text-sm"><UserPlus className="w-4 h-4" /> New</button>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : shown.length === 0 ? (
            <EmptyState icon={Users} title={term ? 'No match' : 'No students yet'} hint={term ? undefined : 'Add a new student to get started.'} />
          ) : (
            <ul className="space-y-1">
              {shown.map(p => {
                const on = picked.has(p.user_id);
                return (
                  <li key={p.user_id}>
                    <label className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors duration-150 ${on ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle(p.user_id)} className="w-5 h-5 accent-brand-500" />
                      <Avatar name={p.full_name} url={p.avatar_url} size="w-8 h-8" />
                      <span className="text-sm font-semibold truncate">{p.full_name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} disabled={busy} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={busy || loading} className="btn-primary flex-1">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save ({picked.size} students)
          </button>
        </div>
      </div>

      {/* New student → created, linked to the creator's referrals, and pre-ticked here. */}
      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={onStudentCreated} />
    </div>
  );
}
