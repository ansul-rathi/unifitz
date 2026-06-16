import { useEffect, useState } from 'react';
import { Megaphone, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, EmptyState } from '../../components/ui';

export default function TeacherAnnouncements() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ challenge_id: '', message: '' });

  async function load() {
    const { data: ch } = await supabase.from('challenges').select('id, name, batch_name').eq('teacher_id', profile.id);
    setChallenges(ch ?? []);
    const ids = (ch ?? []).map(c => c.id);
    if (ids.length) {
      const { data: ann } = await supabase.from('announcements').select('*').in('challenge_id', ids).order('created_at', { ascending: false });
      setRows(ann ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [profile.id]);

  async function post(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from('announcements').insert({
      teacher_id: profile.id,
      challenge_id: form.challenge_id || challenges[0]?.id,
      message: form.message.trim(),
    });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast('Posted — members see it instantly');
    setForm(f => ({ ...f, message: '' }));
    load();
  }

  async function remove(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) return toast(error.message, 'error');
    setRows(r => r.filter(x => x.id !== id));
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold">Announcements</h1>

      <Card className="p-5 md:p-6">
        <form onSubmit={post} className="space-y-3">
          <select required className="input" value={form.challenge_id} onChange={e => setForm(f => ({ ...f, challenge_id: e.target.value }))}>
            <option value="">Post to batch…</option>
            {challenges.map(c => <option key={c.id} value={c.id}>{c.name} — {c.batch_name}</option>)}
          </select>
          <textarea
            required rows="3" maxLength={500}
            placeholder="Tonight's class moved to 7:30 PM — keep water ready!"
            className="input"
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          />
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />} Post announcement
          </button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="Nothing posted yet" hint="Announcements appear on every member's Home instantly." /></Card>
      ) : (
        <div className="space-y-2.5">
          {rows.map(a => (
            <Card key={a.id} className="p-4 flex items-start gap-3">
              <Megaphone className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">{a.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {challenges.find(c => c.id === a.challenge_id)?.name} · {new Date(a.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <button onClick={() => remove(a.id)} aria-label="Delete announcement" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150">
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
