import { useEffect, useState } from 'react';
import { Plus, Pencil, Loader2, X, Video, ImagePlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/compressImage';
import { createZoomMeeting } from '../../lib/zoom';
import { Card, Spinner, EmptyState, SessionThumb, CLASS_TYPES } from '../../components/ui';

const EMPTY = { name: '', description: '', duration_days: 30, is_free: true, teacher_id: '', batch_name: '', start_date: '', status: 'upcoming' };

// Fresh Add-session defaults — today's date, 7:00 PM start.
function freshSession() {
  return {
    day_number: '', title: '', description: '', category: 'Zumba',
    date: new Date().toISOString().slice(0, 10),
    time: '19:00', poster: null,
  };
}

export default function AdminChallenges() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editing, setEditing] = useState(null); // null | {…challenge} | EMPTY
  const [sessionsFor, setSessionsFor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [newSession, setNewSession] = useState(freshSession);
  const [sessDragging, setSessDragging] = useState(false);

  async function load() {
    const [{ data: ch }, { data: t }] = await Promise.all([
      supabase.from('challenges').select('*').order('created_at'),
      supabase.from('profiles').select('id, full_name').eq('role', 'teacher'),
    ]);
    setRows(ch ?? []);
    setTeachers(t ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: editing.name, description: editing.description,
      duration_days: +editing.duration_days, is_free: editing.is_free,
      teacher_id: editing.teacher_id || null, batch_name: editing.batch_name,
      start_date: editing.start_date || null, status: editing.status,
    };
    const q = editing.id
      ? supabase.from('challenges').update(payload).eq('id', editing.id)
      : supabase.from('challenges').insert(payload);
    const { error } = await q;
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast(editing.id ? 'Challenge updated' : 'Challenge created');
    setEditing(null);
    load();
  }

  async function openSessions(c) {
    setSessionsFor(c);
    const { data } = await supabase.from('sessions').select('*').eq('challenge_id', c.id).order('day_number');
    setSessions(data ?? []);
  }

  async function addSession(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: created, error } = await supabase.from('sessions').insert({
        challenge_id: sessionsFor.id,
        day_number: +newSession.day_number,
        title: newSession.title,
        description: newSession.description || null,
        category: newSession.category || null,
        scheduled_at: newSession.date && newSession.time ? new Date(`${newSession.date}T${newSession.time}`).toISOString() : null,
        duration_minutes: 60,
        session_type: 'live',
      }).select('id').single();
      if (error) throw error;

      if (newSession.poster) {
        const small = await compressImage(newSession.poster);
        const path = `${sessionsFor.id}/${created.id}.jpg`;
        const { error: upErr } = await supabase.storage.from('posters').upload(path, small, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('posters').getPublicUrl(path);
        await supabase.from('sessions').update({ poster_url: pub.publicUrl }).eq('id', created.id);
      }

      try {
        await createZoomMeeting(created.id);
        toast('Session added + Zoom meeting created');
      } catch {
        toast('Session added (Zoom not created — check secrets)', 'error');
      }
      setNewSession(freshSession());
      setSessDragging(false);
      openSessions(sessionsFor);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Challenges</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary !py-2.5 text-sm">
          <Plus className="w-4 h-4" /> New challenge
        </button>
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState title="No challenges yet" /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(c => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.batch_name} · {c.duration_days} days · {c.status} · {c.is_free ? 'FREE' : 'PAID'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Teacher: {teachers.find(t => t.id === c.teacher_id)?.full_name ?? '—'} · starts {c.start_date ?? 'TBD'}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setEditing({ ...c })} aria-label="Edit" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => openSessions(c)} aria-label="Sessions" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Video className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <form onSubmit={save} className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[88vh] overflow-y-auto animate-fade-up space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{editing.id ? 'Edit challenge' : 'New challenge'}</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <input required placeholder="Name" className="input" value={editing.name} onChange={e => setEditing(x => ({ ...x, name: e.target.value }))} />
            <textarea rows="2" placeholder="Description" className="input" value={editing.description ?? ''} onChange={e => setEditing(x => ({ ...x, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="1" placeholder="Duration (days)" className="input" value={editing.duration_days} onChange={e => setEditing(x => ({ ...x, duration_days: e.target.value }))} />
              <input placeholder="Batch name" className="input" value={editing.batch_name ?? ''} onChange={e => setEditing(x => ({ ...x, batch_name: e.target.value }))} />
              <input type="date" className="input" value={editing.start_date ?? ''} onChange={e => setEditing(x => ({ ...x, start_date: e.target.value }))} />
              <select className="input" value={editing.status} onChange={e => setEditing(x => ({ ...x, status: e.target.value }))}>
                {['upcoming', 'active', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input" value={editing.teacher_id ?? ''} onChange={e => setEditing(x => ({ ...x, teacher_id: e.target.value }))}>
                <option value="">Assign teacher…</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={editing.is_free} onChange={e => setEditing(x => ({ ...x, is_free: e.target.checked }))} className="w-5 h-5 accent-brand-500" />
                Free challenge
              </label>
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
          </form>
        </div>
      )}

      {/* Sessions modal */}
      {sessionsFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[88vh] overflow-y-auto animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{sessionsFor.name} — sessions</h3>
              <button onClick={() => setSessionsFor(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <ul className="mt-3 divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {sessions.map(s => (
                <li key={s.id} className="py-2 flex items-center gap-3 text-sm">
                  <SessionThumb poster={s.poster_url} day={s.day_number} live={s.is_live_next} size="w-16 h-10" />
                  <span className="flex-1 truncate">{s.title}</span>
                  <span className="text-xs text-slate-400">{s.scheduled_at && new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </li>
              ))}
              {sessions.length === 0 && <li className="py-3 text-sm text-slate-400">No sessions yet.</li>}
            </ul>
            <form onSubmit={addSession} className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <input required type="number" min="1" placeholder="Day #" className="input !py-2 text-sm" value={newSession.day_number} onChange={e => setNewSession(x => ({ ...x, day_number: e.target.value }))} />
              <select className="input !py-2 text-sm" value={newSession.category} onChange={e => setNewSession(x => ({ ...x, category: e.target.value }))} aria-label="Class type">
                {CLASS_TYPES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
              </select>
              <input required placeholder="Title" className="input !py-2 text-sm col-span-2" value={newSession.title} onChange={e => setNewSession(x => ({ ...x, title: e.target.value }))} />
              <textarea placeholder="Description (optional)" rows="2" className="input !py-2 text-sm col-span-2" value={newSession.description} onChange={e => setNewSession(x => ({ ...x, description: e.target.value }))} />
              <div>
                <label className="label !text-xs" htmlFor="admin-date">Date</label>
                <input id="admin-date" required type="date" className="input !py-2 text-sm" value={newSession.date} onChange={e => setNewSession(x => ({ ...x, date: e.target.value }))} />
              </div>
              <div>
                <label className="label !text-xs" htmlFor="admin-time">Start time</label>
                <input id="admin-time" required type="time" className="input !py-2 text-sm" value={newSession.time} onChange={e => setNewSession(x => ({ ...x, time: e.target.value }))} />
              </div>
              <p className="col-span-2 flex items-center gap-2 text-xs text-slate-500">
                <Video className="w-4 h-4 text-sky-500 shrink-0" />
                A Zoom meeting (cloud-recorded, 60 min) is created automatically.
              </p>
              <div className="col-span-2">
                <label className="label !text-xs">Poster image <span className="font-normal text-slate-400">(16:9, optional)</span></label>
                {newSession.poster ? (
                  <div className="relative w-40">
                    <img src={URL.createObjectURL(newSession.poster)} alt="Poster preview" className="w-full aspect-video object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setNewSession(x => ({ ...x, poster: null }))}
                      aria-label="Remove image"
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/70 text-white hover:bg-slate-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={e => { e.preventDefault(); setSessDragging(true); }}
                    onDragLeave={() => setSessDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setSessDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f?.type.startsWith('image/')) setNewSession(x => ({ ...x, poster: f }));
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors duration-200 ${
                      sessDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                    }`}
                  >
                    <ImagePlus className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">
                      {sessDragging ? 'Drop to attach' : 'Drag & drop or click to browse'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setNewSession(x => ({ ...x, poster: e.target.files?.[0] ?? null }))} />
                  </label>
                )}
              </div>
              <button type="submit" disabled={busy} className="btn-primary col-span-2 !py-2.5 text-sm">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Add session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
