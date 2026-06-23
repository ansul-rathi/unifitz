import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Pencil, Check, X, Plus, Trash2, Video, PlayCircle, Radio,
  CheckCircle2, Copy, Eye, EyeOff, Users, IndianRupee, ImagePlus, CalendarDays, Layers, Sparkles, Upload,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/compressImage';
import { createZoomMeeting, generateSessionImage, generateSeriesImage } from '../../lib/zoom';
import { Card, Spinner, EmptyState, Avatar, StatCard, SessionThumb, CLASS_TYPES } from '../../components/ui';
import Select from '../../components/Select';

const blankSession = () => ({
  type: 'live', day_number: '', title: '', description: '', category: 'Strength Training',
  recording_link: '', date: new Date().toISOString().slice(0, 10), time: '07:00',
});

export default function AdminSeriesDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const isAdmin = profile.role === 'admin';
  const backTo = isAdmin ? '/admin/challenges' : '/teacher/series';
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [c, setC] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherIds, setTeacherIds] = useState([]);
  const [stats, setStats] = useState({ enrolled: 0, gross: 0 });
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState(null);
  const [add, setAdd] = useState(blankSession());
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const [{ data: ch }, { data: ses }, { data: t }, { data: cts }, { count: enrCount }, { data: pays }] = await Promise.all([
      supabase.from('challenges').select('*').eq('id', id).single(),
      supabase.from('sessions').select('*').eq('challenge_id', id).order('day_number'),
      supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'teacher'),
      supabase.from('challenge_teachers').select('teacher_id').eq('challenge_id', id),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('challenge_id', id),
      supabase.from('payments').select('amount, status').eq('challenge_id', id),
    ]);
    setC(ch);
    setSessions(ses ?? []);
    setTeachers(t ?? []);
    setTeacherIds((cts ?? []).map(x => x.teacher_id));
    setStats({
      enrolled: enrCount ?? 0,
      gross: (pays ?? []).filter(p => ['paid', 'verified'].includes(p.status)).reduce((s, p) => s + Number(p.amount), 0),
    });
    setLoading(false);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  function startEdit() {
    setF({
      name: c.name, description: c.description ?? '', duration_days: c.duration_days,
      batch_name: c.batch_name ?? '', start_date: c.start_date ?? '', status: c.status,
      is_free: c.is_free, price: c.price ?? '', is_published: c.is_published !== false,
      free_session_count: c.free_session_count ?? 0,
      teacherIds: [...teacherIds], poster: null,
    });
    setEditing(true);
  }

  async function saveDetails(e) {
    e.preventDefault();
    setBusy(true);
    try {
      // Teachers may edit content (name/description/schedule/sessions) but not
      // pricing, visibility or the teacher roster — those stay admin-only.
      const freePreview = Math.max(0, parseInt(f.free_session_count, 10) || 0);
      const update = isAdmin
        ? {
            name: f.name, description: f.description, duration_days: +f.duration_days,
            batch_name: f.batch_name, start_date: f.start_date || null, status: f.status,
            is_free: f.is_free, price: f.is_free ? 0 : (f.price === '' ? 0 : +f.price),
            is_published: f.is_published, teacher_id: f.teacherIds[0] || null,
            free_session_count: freePreview,
          }
        : {
            name: f.name, description: f.description, duration_days: +f.duration_days,
            batch_name: f.batch_name, start_date: f.start_date || null, status: f.status,
            free_session_count: freePreview,
          };
      await supabase.from('challenges').update(update).eq('id', id);
      if (f.poster) {
        const small = await compressImage(f.poster);
        const path = `challenge/${id}.jpg`;
        await supabase.storage.from('posters').upload(path, small, { upsert: true });
        const { data: pub } = supabase.storage.from('posters').getPublicUrl(path);
        await supabase.from('challenges').update({ poster_url: `${pub.publicUrl}?t=${Date.now()}` }).eq('id', id);
      }
      if (isAdmin) {
        await supabase.from('challenge_teachers').delete().eq('challenge_id', id);
        if (f.teacherIds.length) await supabase.from('challenge_teachers').insert(f.teacherIds.map(tid => ({ challenge_id: id, teacher_id: tid })));
      }
      toast('Series updated');
      setEditing(false);
      load();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  async function togglePublish() {
    await supabase.from('challenges').update({ is_published: !c.is_published }).eq('id', id);
    toast(c.is_published ? 'Hidden from students & teachers' : 'Published');
    load();
  }

  async function addSession(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const isRec = add.type === 'recording';
      const { data: created, error } = await supabase.from('sessions').insert({
        challenge_id: id, day_number: +add.day_number, title: add.title,
        description: add.description || null, category: add.category || null,
        scheduled_at: add.date && add.time ? new Date(`${add.date}T${add.time}`).toISOString() : null,
        duration_minutes: 45, session_type: isRec ? 'recording' : 'live',
        completed: isRec, recording_link: isRec ? (add.recording_link || null) : null,
      }).select('id').single();
      if (error) throw error;
      if (!isRec) { try { await createZoomMeeting(created.id); } catch { /* zoom optional */ } }
      toast(isRec ? 'Recording added' : 'Session added');
      setAdd(blankSession()); setShowAdd(false); load();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  async function patchSession(sid, patch, msg) {
    const { error } = await supabase.from('sessions').update(patch).eq('id', sid);
    if (error) return toast(error.message, 'error');
    if (msg) toast(msg);
    load();
  }

  async function deleteSession(sid) {
    if (!confirm('Delete this session?')) return;
    await supabase.from('sessions').delete().eq('id', sid);
    toast('Session deleted');
    load();
  }

  async function createZoom(sid) {
    setBusy(true);
    try { await createZoomMeeting(sid); toast('Zoom meeting created'); load(); }
    catch (err) { toast(err.message || 'Zoom failed', 'error'); } finally { setBusy(false); }
  }

  // ── Image management ──
  async function uploadSessionImage(s, file) {
    if (!file) return;
    setBusy(true);
    try {
      const small = await compressImage(file);
      const path = `${id}/${s.id}.jpg`;
      await supabase.storage.from('posters').upload(path, small, { upsert: true });
      const { data: pub } = supabase.storage.from('posters').getPublicUrl(path);
      await patchSession(s.id, { poster_url: `${pub.publicUrl}?t=${Date.now()}` }, 'Image uploaded');
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }
  async function aiSessionImage(s) {
    setBusy(true);
    try { await generateSessionImage(s.id); toast('AI image generated'); load(); }
    catch (err) { toast(err.message || 'AI image failed', 'error'); } finally { setBusy(false); }
  }
  async function aiSeriesImage() {
    setBusy(true);
    try { await generateSeriesImage(id); toast('AI banner generated'); load(); }
    catch (err) { toast(err.message || 'AI image failed', 'error'); } finally { setBusy(false); }
  }
  async function uploadSeriesImage(file) {
    if (!file) return;
    setBusy(true);
    try {
      const small = await compressImage(file);
      const path = `challenge/${id}.jpg`;
      await supabase.storage.from('posters').upload(path, small, { upsert: true });
      const { data: pub } = supabase.storage.from('posters').getPublicUrl(path);
      await supabase.from('challenges').update({ poster_url: `${pub.publicUrl}?t=${Date.now()}` }).eq('id', id);
      toast('Series image updated'); load();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  if (loading) return <Spinner />;
  if (!c) return <EmptyState title="Series not found" />;

  const completed = sessions.filter(s => s.completed).length;
  const pct = sessions.length ? Math.round((completed / sessions.length) * 100) : 0;
  const assignedTeachers = teachers.filter(t => teacherIds.includes(t.id));

  return (
    <div className="space-y-5">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> All series</Link>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="relative group">
          {c.poster_url
            ? <img src={c.poster_url} alt={c.name} className="w-full aspect-[16/6] object-cover" />
            : <div className="w-full aspect-[16/6] bg-gradient-to-br from-brand-400 to-orange-600 flex items-center justify-center"><Layers className="w-10 h-10 text-white/80" /></div>}
          <div className="absolute top-3 right-3 flex gap-2">
            <label className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer shadow">
              <Upload className="w-4 h-4" /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadSeriesImage(e.target.files?.[0])} />
            </label>
            <button onClick={aiSeriesImage} disabled={busy} className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI image
            </button>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{c.name}</h1>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'upcoming' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.is_free ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>{c.is_free ? 'FREE' : `₹${c.price}`}</span>
                {!c.is_published && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">Hidden</span>}
              </div>
              <p className="mt-1 text-sm text-slate-600">{c.description}</p>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {c.batch_name || 'No batch'} · {c.duration_days} days · starts {c.start_date ?? 'TBD'}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {isAdmin && <button onClick={togglePublish} className="btn-secondary !py-2 !px-3 text-sm">{c.is_published ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Publish</>}</button>}
              <button onClick={startEdit} className="btn-primary !py-2 !px-3 text-sm"><Pencil className="w-4 h-4" /> Edit details</button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Teachers:</span>
            {assignedTeachers.length ? <div className="flex -space-x-2">{assignedTeachers.map(t => <Avatar key={t.id} name={t.full_name} url={t.avatar_url} size="w-7 h-7" />)}</div> : <span className="text-xs text-slate-400">None</span>}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Enrolled" value={stats.enrolled} to={isAdmin ? '/admin/users?role=client' : undefined} />
        <StatCard icon={Video} label="Sessions" value={sessions.length} accent="text-violet-500" />
        <StatCard icon={CheckCircle2} label="Completed" value={`${completed} (${pct}%)`} accent="text-emerald-500" />
        <StatCard icon={IndianRupee} label="Revenue" value={c.is_free ? '—' : `₹${stats.gross.toLocaleString('en-IN')}`} accent="text-emerald-500" to={isAdmin ? '/admin/revenue' : undefined} />
      </div>

      {/* Edit details modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true" onClick={() => !busy && setEditing(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-5 md:p-6 max-h-[90vh] overflow-y-auto animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Edit series</h3>
              <button type="button" onClick={() => setEditing(false)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
          <form onSubmit={saveDetails} className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Series name" className="input sm:col-span-2" value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} />
            <textarea rows="2" placeholder="Description" className="input sm:col-span-2" value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} />
            <input type="number" min="1" placeholder="Duration (days)" className="input" value={f.duration_days} onChange={e => setF(x => ({ ...x, duration_days: e.target.value }))} />
            <input placeholder="Batch name" className="input" value={f.batch_name} onChange={e => setF(x => ({ ...x, batch_name: e.target.value }))} />
            <input type="date" className="input" value={f.start_date} onChange={e => setF(x => ({ ...x, start_date: e.target.value }))} />
            <Select value={f.status} onChange={v => setF(x => ({ ...x, status: v }))} options={['upcoming', 'active', 'completed']} />
            <div className="sm:col-span-2">
              <label className="label" htmlFor="free_session_count">Free preview sessions <span className="font-normal text-slate-400">(first N unlocked for everyone)</span></label>
              <input id="free_session_count" type="number" min="0" className="input" value={f.free_session_count}
                onChange={e => setF(x => ({ ...x, free_session_count: e.target.value }))} placeholder="e.g. 3" />
              <p className="mt-1 text-xs text-slate-400">Students can watch the first {f.free_session_count || 0} session{(+f.free_session_count === 1) ? '' : 's'} free; the rest stay locked until they enroll.</p>
            </div>
            {isAdmin && (
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                <input type="checkbox" checked={f.is_published} onChange={e => setF(x => ({ ...x, is_published: e.target.checked }))} className="w-5 h-5 accent-brand-500" /> Visible to students &amp; teachers
              </label>
            )}
            {isAdmin && (
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={f.is_free} onChange={e => setF(x => ({ ...x, is_free: e.target.checked }))} className="w-5 h-5 accent-brand-500" /> Free series
              </label>
            )}
            {isAdmin && !f.is_free && <div className="flex items-center gap-2"><span className="text-slate-400">₹</span><input type="number" min="0" placeholder="Price" className="input" value={f.price} onChange={e => setF(x => ({ ...x, price: e.target.value }))} /></div>}
            {isAdmin && (
              <div className="sm:col-span-2">
                <span className="label">Teachers</span>
                <div className="grid grid-cols-2 gap-2">
                  {teachers.map(t => {
                    const on = f.teacherIds.includes(t.id);
                    return <label key={t.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${on ? 'border-brand-400 bg-brand-50 text-brand-700 font-semibold' : 'border-slate-200 text-slate-600'}`}>
                      <input type="checkbox" checked={on} className="w-4 h-4 accent-brand-500" onChange={() => setF(x => { const s = new Set(x.teacherIds); s.has(t.id) ? s.delete(t.id) : s.add(t.id); return { ...x, teacherIds: [...s] }; })} />{t.full_name}
                    </label>;
                  })}
                </div>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="label">Series image</label>
              <input type="file" accept="image/*" onChange={e => setF(x => ({ ...x, poster: e.target.files?.[0] ?? null }))} className="block text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:text-xs file:border-0 file:bg-slate-100 file:rounded-lg file:font-semibold file:cursor-pointer" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary"><X className="w-4 h-4" /> Cancel</button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Sessions */}
      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-lg">Sessions ({sessions.length})</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary !py-2 text-sm"><Plus className="w-4 h-4" /> Add session</button>
        </div>

        {showAdd && (
          <form onSubmit={addSession} className="mt-4 grid sm:grid-cols-2 gap-2 border border-slate-200 rounded-xl p-4">
            <div className="sm:col-span-2 inline-flex rounded-lg bg-slate-100 p-0.5 text-sm font-bold">
              {[['live', 'Live (Zoom)'], ['recording', 'Recording']].map(([v, l]) => (
                <button type="button" key={v} onClick={() => setAdd(x => ({ ...x, type: v }))} className={`flex-1 py-2 rounded-md ${add.type === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{l}</button>
              ))}
            </div>
            <input required type="number" min="1" placeholder="Day #" className="input !py-2 text-sm" value={add.day_number} onChange={e => setAdd(x => ({ ...x, day_number: e.target.value }))} />
            <Select value={add.category} onChange={v => setAdd(x => ({ ...x, category: v }))} options={CLASS_TYPES.map(c => c.value)} buttonClassName="!py-2 text-sm" />
            <input required placeholder="Title" className="input !py-2 text-sm sm:col-span-2" value={add.title} onChange={e => setAdd(x => ({ ...x, title: e.target.value }))} />
            <textarea rows="2" placeholder="Description" className="input !py-2 text-sm sm:col-span-2" value={add.description} onChange={e => setAdd(x => ({ ...x, description: e.target.value }))} />
            <input required type="date" className="input !py-2 text-sm" value={add.date} onChange={e => setAdd(x => ({ ...x, date: e.target.value }))} />
            <input required type="time" className="input !py-2 text-sm" value={add.time} onChange={e => setAdd(x => ({ ...x, time: e.target.value }))} />
            {add.type === 'recording'
              ? <input required type="url" placeholder="Recording link" className="input !py-2 text-sm sm:col-span-2" value={add.recording_link} onChange={e => setAdd(x => ({ ...x, recording_link: e.target.value }))} />
              : <p className="sm:col-span-2 text-xs text-slate-500">A Zoom meeting is auto-created.</p>}
            <button type="submit" disabled={busy} className="btn-primary sm:col-span-2 !py-2 text-sm">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Create</button>
          </form>
        )}

        {sessions.length === 0 ? (
          <EmptyState icon={Video} title="No sessions yet" />
        ) : (
          <ul className="mt-4 space-y-2.5">
            {sessions.map(s => (
              <li key={s.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start gap-3">
                  <SessionThumb poster={s.poster_url} day={s.day_number} live={s.is_live_next} size="w-20 h-12" />
                  <div className="flex-1 min-w-0">
                    <input
                      defaultValue={s.title}
                      onBlur={e => e.target.value !== s.title && patchSession(s.id, { title: e.target.value }, 'Title saved')}
                      className="w-full font-bold text-sm bg-transparent focus:bg-slate-50 rounded px-1 -mx-1 outline-none"
                    />
                    <p className="text-xs text-slate-500">
                      Day {s.day_number} · {s.category || '—'} · {s.session_type}
                      {s.scheduled_at && <> · {new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                    </p>
                  </div>
                  {isAdmin && <button onClick={() => deleteSession(s.id)} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"><Trash2 className="w-4 h-4" /></button>}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* recording link inline — keyed on value so the webhook-set
                      link shows after reload (uncontrolled input otherwise sticks). */}
                  <input
                    key={`rec-${s.id}-${s.recording_link ?? ''}`}
                    type="url"
                    defaultValue={s.recording_link ?? ''}
                    placeholder="Recording link"
                    onBlur={e => e.target.value !== (s.recording_link ?? '') && patchSession(s.id, { recording_link: e.target.value }, 'Recording link saved')}
                    className="input !py-1.5 !px-2.5 text-xs flex-1 min-w-[180px]"
                  />
                  {s.recording_link && <a href={s.recording_link} target="_blank" rel="noreferrer" className="btn-secondary !py-1.5 !px-2.5 text-xs"><PlayCircle className="w-4 h-4" /></a>}
                  {s.zoom_meeting_id
                    ? <button onClick={() => { navigator.clipboard.writeText(s.zoom_join_url || ''); toast('Join link copied'); }} className="btn-secondary !py-1.5 !px-2.5 text-xs"><Copy className="w-4 h-4 text-sky-500" /></button>
                    : <button onClick={() => createZoom(s.id)} disabled={busy} className="btn-secondary !py-1.5 !px-2.5 text-xs"><Video className="w-4 h-4 text-sky-500" /> Zoom</button>}
                  {/* Join link — auto-filled when Zoom meeting is created; editable.
                      Keyed on value so the auto-created link appears after reload. */}
                  <input
                    key={`zl-${s.id}-${s.zoom_link ?? ''}`}
                    type="url"
                    defaultValue={s.zoom_link ?? ''}
                    placeholder="Join link (auto-filled from Zoom)"
                    onBlur={e => e.target.value !== (s.zoom_link ?? '') && patchSession(s.id, { zoom_link: e.target.value || null }, 'Manual link saved')}
                    className="input !py-1.5 !px-2.5 text-xs flex-1 min-w-[160px]"
                  />
                  <button onClick={() => patchSession(s.id, { completed: !s.completed }, s.completed ? 'Marked incomplete' : 'Marked completed')}
                    className={`btn-secondary !py-1.5 !px-2.5 text-xs ${s.completed ? 'text-emerald-600' : ''}`}>
                    <CheckCircle2 className="w-4 h-4" /> {s.completed ? 'Done' : 'Mark done'}
                  </button>
                  {!s.is_live_next && !s.completed && (
                    <button onClick={async () => { await supabase.from('sessions').update({ is_live_next: false }).eq('challenge_id', id); patchSession(s.id, { is_live_next: true }, 'Pinned live'); }}
                      className="btn-secondary !py-1.5 !px-2.5 text-xs"><Radio className="w-4 h-4 text-red-500" /></button>
                  )}
                  {/* Image controls */}
                  <label title="Upload image" className="btn-secondary !py-1.5 !px-2.5 text-xs cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => uploadSessionImage(s, e.target.files?.[0])} />
                  </label>
                  <button onClick={() => aiSessionImage(s)} disabled={busy} title="Generate AI image" className="btn-secondary !py-1.5 !px-2.5 text-xs"><Sparkles className="w-4 h-4 text-violet-500" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
