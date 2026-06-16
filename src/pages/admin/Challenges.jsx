import { useEffect, useState } from 'react';
import { Plus, Pencil, Loader2, X, Video, ImagePlus, Users, IndianRupee, CalendarDays, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/compressImage';
import { createZoomMeeting } from '../../lib/zoom';
import { Card, Spinner, EmptyState, SessionThumb, CLASS_TYPES, Avatar, StatCard } from '../../components/ui';

const EMPTY = { name: '', description: '', duration_days: 30, is_free: true, price: '', currency: 'INR', teacher_id: '', batch_name: '', start_date: '', status: 'upcoming', poster_url: '', teacherIds: [], poster: null };

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

  const [stats, setStats] = useState({}); // challenge_id → { enrolled, sessions, gross, teachers[] }

  async function load() {
    const [{ data: ch }, { data: t }, { data: enr }, { data: ses }, { data: pays }, { data: cts }, { data: profs }] = await Promise.all([
      supabase.from('challenges').select('*').order('created_at'),
      supabase.from('profiles').select('id, full_name').eq('role', 'teacher'),
      supabase.from('enrollments').select('challenge_id'),
      supabase.from('sessions').select('challenge_id'),
      supabase.from('payments').select('challenge_id, amount, status'),
      supabase.from('challenge_teachers').select('challenge_id, teacher_id'),
      supabase.from('profiles').select('id, full_name, avatar_url'),
    ]);
    setRows(ch ?? []);
    setTeachers(t ?? []);

    const nameMap = Object.fromEntries((profs ?? []).map(p => [p.id, p]));
    const agg = {};
    for (const c of ch ?? []) agg[c.id] = { enrolled: 0, sessions: 0, gross: 0, teachers: [] };
    for (const e of enr ?? []) if (agg[e.challenge_id]) agg[e.challenge_id].enrolled++;
    for (const s of ses ?? []) if (agg[s.challenge_id]) agg[s.challenge_id].sessions++;
    for (const p of pays ?? []) if (agg[p.challenge_id] && ['paid', 'verified'].includes(p.status)) agg[p.challenge_id].gross += Number(p.amount);
    for (const ct of cts ?? []) if (agg[ct.challenge_id]) agg[ct.challenge_id].teachers.push(nameMap[ct.teacher_id]);
    setStats(agg);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openEdit(c) {
    // Load existing teacher assignments for multi-select.
    let teacherIds = [];
    if (c.id) {
      const { data } = await supabase.from('challenge_teachers').select('teacher_id').eq('challenge_id', c.id);
      teacherIds = (data ?? []).map(r => r.teacher_id);
    }
    setEditing({ ...c, teacherIds, poster: null, price: c.price ?? '' });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const ids = editing.teacherIds ?? [];
      const payload = {
        name: editing.name, description: editing.description,
        duration_days: +editing.duration_days,
        is_free: editing.is_free,
        price: editing.is_free ? 0 : (editing.price === '' ? 0 : +editing.price),
        currency: editing.currency || 'INR',
        teacher_id: ids[0] || null,  // keep legacy lead-teacher in sync
        batch_name: editing.batch_name,
        start_date: editing.start_date || null, status: editing.status,
      };
      let challengeId = editing.id;
      if (challengeId) {
        const { error } = await supabase.from('challenges').update(payload).eq('id', challengeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('challenges').insert(payload).select('id').single();
        if (error) throw error;
        challengeId = data.id;
      }

      // Poster upload (optional).
      if (editing.poster) {
        const small = await compressImage(editing.poster);
        const path = `challenge/${challengeId}.jpg`;
        const { error: upErr } = await supabase.storage.from('posters').upload(path, small, { upsert: true });
        if (!upErr) {
          const { data: pub } = supabase.storage.from('posters').getPublicUrl(path);
          await supabase.from('challenges').update({ poster_url: `${pub.publicUrl}?t=${Date.now()}` }).eq('id', challengeId);
        }
      }

      // Sync challenge_teachers (replace set).
      await supabase.from('challenge_teachers').delete().eq('challenge_id', challengeId);
      if (ids.length) {
        await supabase.from('challenge_teachers').insert(ids.map(teacher_id => ({ challenge_id: challengeId, teacher_id })));
      }

      toast(editing.id ? 'Series updated' : 'Series created');
      setEditing(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold">Series</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary !py-2.5 text-sm">
          <Plus className="w-4 h-4" /> New series
        </button>
      </div>

      {/* Portfolio summary */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Layers} label="Series" value={rows.length} />
          <StatCard icon={Users} label="Total enrolled" value={Object.values(stats).reduce((s, x) => s + x.enrolled, 0)} accent="text-sky-500" />
          <StatCard icon={Video} label="Sessions" value={Object.values(stats).reduce((s, x) => s + x.sessions, 0)} accent="text-violet-500" />
          <StatCard icon={IndianRupee} label="Gross revenue" value={`₹${Object.values(stats).reduce((s, x) => s + x.gross, 0).toLocaleString('en-IN')}`} accent="text-emerald-500" />
        </div>
      )}

      {rows.length === 0 ? (
        <Card><EmptyState title="No series yet" hint="Create your first series to get started." /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(c => {
            const st = stats[c.id] ?? { enrolled: 0, sessions: 0, gross: 0, teachers: [] };
            const day = c.start_date ? Math.min(Math.max(Math.floor((Date.now() - new Date(c.start_date)) / 86400000) + 1, 0), c.duration_days) : 0;
            return (
              <Card key={c.id} className="overflow-hidden flex flex-col">
                {c.poster_url
                  ? <img src={c.poster_url} alt={c.name} className="w-full aspect-[16/7] object-cover" />
                  : <div className="w-full aspect-[16/7] bg-gradient-to-br from-brand-400 to-orange-600 flex items-center justify-center"><Layers className="w-8 h-8 text-white/80" /></div>}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold truncate">{c.name}</h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'upcoming' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                        }`}>{c.status}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.is_free ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>{c.is_free ? 'FREE' : `₹${c.price}`}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {c.batch_name || 'No batch'} · {c.duration_days} days · starts {c.start_date ?? 'TBD'}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => openEdit(c)} title="Edit" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => openSessions(c)} title="Sessions" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Video className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {c.status === 'active' && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.duration_days ? (day / c.duration_days) * 100 : 0}%` }} /></div>
                      <p className="mt-1 text-[11px] text-slate-400">Day {day} of {c.duration_days}</p>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl py-2"><p className="font-display text-lg font-bold">{st.enrolled}</p><p className="text-[11px] text-slate-500 font-semibold">enrolled</p></div>
                    <div className="bg-slate-50 rounded-xl py-2"><p className="font-display text-lg font-bold">{st.sessions}</p><p className="text-[11px] text-slate-500 font-semibold">sessions</p></div>
                    <div className="bg-slate-50 rounded-xl py-2"><p className="font-display text-lg font-bold">{c.is_free ? '—' : `₹${st.gross.toLocaleString('en-IN')}`}</p><p className="text-[11px] text-slate-500 font-semibold">revenue</p></div>
                  </div>

                  {/* Teachers */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Teachers:</span>
                    {st.teachers.length ? (
                      <div className="flex -space-x-2">
                        {st.teachers.slice(0, 4).map((t, i) => <Avatar key={i} name={t?.full_name} url={t?.avatar_url} size="w-7 h-7" />)}
                        {st.teachers.length > 4 && <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">+{st.teachers.length - 4}</span>}
                      </div>
                    ) : <span className="text-xs text-slate-400">None assigned</span>}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(c)} className="btn-secondary flex-1 !py-2 text-xs"><Pencil className="w-4 h-4" /> Edit series</button>
                    <button onClick={() => openSessions(c)} className="btn-primary flex-1 !py-2 text-xs"><Video className="w-4 h-4" /> Sessions ({st.sessions})</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit / create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <form onSubmit={save} className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[88vh] overflow-y-auto animate-fade-up space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{editing.id ? 'Edit series' : 'New series'}</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <input required placeholder="Series name" className="input" value={editing.name} onChange={e => setEditing(x => ({ ...x, name: e.target.value }))} />
            <textarea rows="2" placeholder="Description" className="input" value={editing.description ?? ''} onChange={e => setEditing(x => ({ ...x, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="1" placeholder="Duration (days)" className="input" value={editing.duration_days} onChange={e => setEditing(x => ({ ...x, duration_days: e.target.value }))} />
              <input placeholder="Batch name" className="input" value={editing.batch_name ?? ''} onChange={e => setEditing(x => ({ ...x, batch_name: e.target.value }))} />
              <input type="date" className="input" value={editing.start_date ?? ''} onChange={e => setEditing(x => ({ ...x, start_date: e.target.value }))} />
              <select className="input" value={editing.status} onChange={e => setEditing(x => ({ ...x, status: e.target.value }))}>
                {['upcoming', 'active', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Pricing */}
            <div className="rounded-xl border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={editing.is_free} onChange={e => setEditing(x => ({ ...x, is_free: e.target.checked }))} className="w-5 h-5 accent-brand-500" />
                Free series
              </label>
              {!editing.is_free && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">₹</span>
                  <input type="number" min="0" placeholder="Amount (e.g. 999)" className="input" value={editing.price} onChange={e => setEditing(x => ({ ...x, price: e.target.value }))} />
                </div>
              )}
            </div>

            {/* Multiple teachers */}
            <div>
              <span className="label">Assign teachers</span>
              <div className="grid grid-cols-2 gap-2">
                {teachers.map(t => {
                  const on = (editing.teacherIds ?? []).includes(t.id);
                  return (
                    <label key={t.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors duration-150 ${on ? 'border-brand-400 bg-brand-50 text-brand-700 font-semibold' : 'border-slate-200 text-slate-600'}`}>
                      <input type="checkbox" checked={on} className="w-4 h-4 accent-brand-500"
                        onChange={() => setEditing(x => {
                          const ids = new Set(x.teacherIds ?? []);
                          ids.has(t.id) ? ids.delete(t.id) : ids.add(t.id);
                          return { ...x, teacherIds: [...ids] };
                        })} />
                      {t.full_name}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Poster image */}
            <div>
              <label className="label">Series image <span className="font-normal text-slate-400">(16:9, optional)</span></label>
              {editing.poster ? (
                <div className="relative w-40">
                  <img src={URL.createObjectURL(editing.poster)} alt="Preview" className="w-full aspect-video object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => setEditing(x => ({ ...x, poster: null }))} aria-label="Remove" className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/70 text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : editing.poster_url ? (
                <div className="flex items-center gap-3">
                  <img src={editing.poster_url} alt="Current" className="w-28 aspect-video object-cover rounded-lg border border-slate-200" />
                  <label className="btn-secondary !py-2 text-xs cursor-pointer">Replace<input type="file" accept="image/*" className="hidden" onChange={e => setEditing(x => ({ ...x, poster: e.target.files?.[0] ?? null }))} /></label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-400 px-4 py-6 text-center cursor-pointer transition-colors duration-200">
                  <ImagePlus className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">Upload series image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setEditing(x => ({ ...x, poster: e.target.files?.[0] ?? null }))} />
                </label>
              )}
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
