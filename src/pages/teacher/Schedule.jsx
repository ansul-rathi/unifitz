import { useEffect, useState, useCallback } from 'react';
import {
  Video, Upload, Radio, CheckCircle2, ClipboardCheck, X, Loader2, Plus, ImagePlus, ImageOff,
  Copy, Sparkles, Share2, Link2, RotateCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/compressImage';
import { createZoomMeeting, generateSessionImage } from '../../lib/zoom';
import { Card, Spinner, EmptyState, Avatar, SessionThumb, CategoryIcon, CLASS_TYPES } from '../../components/ui';

// Fresh Add-session defaults — today's date, 7:00 PM start.
function freshAdd() {
  return {
    challenge_id: '', day_number: '', title: '', description: '', category: 'Zumba',
    type: 'live', recording_link: '',
    date: new Date().toISOString().slice(0, 10),
    time: '19:00', duration_minutes: 60, poster: null,
  };
}

// Small icon-only action button with a hover tooltip.
function IconBtn({ icon: Icon, label, onClick, href, tone = 'text-slate-500', disabled, spinning }) {
  const cls = 'inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const inner = spinning ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <Icon className={`w-4 h-4 ${tone}`} />;
  return href
    ? <a href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className={cls}>{inner}</a>
    : <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className={cls}>{inner}</button>;
}

export default function TeacherSchedule() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceFor, setAttendanceFor] = useState(null); // session being marked
  const [roster, setRoster] = useState([]);
  const [marked, setMarked] = useState(new Set());
  const [unmatched, setUnmatched] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState(freshAdd);
  const [addDragging, setAddDragging] = useState(false);
  const [posterFor, setPosterFor] = useState(null); // session whose image modal is open
  const [editingPoster, setEditingPoster] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [aiFor, setAiFor] = useState(null);       // session whose AI-image modal is open
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: ch } = await supabase.from('challenges').select('*').eq('teacher_id', profile.id);
    setChallenges(ch ?? []);
    const ids = (ch ?? []).map(c => c.id);
    if (ids.length) {
      const { data: ses } = await supabase.from('sessions').select('*, challenges(name, batch_name)')
        .in('challenge_id', ids).order('day_number', { ascending: false });
      setSessions(ses ?? []);
    }
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  async function patchSession(id, patch, msg) {
    const { error } = await supabase.from('sessions').update(patch).eq('id', id);
    if (error) return toast(error.message, 'error');
    toast(msg);
    load();
  }

  async function setLiveNext(session) {
    // Only one pinned session per challenge: unpin siblings first.
    await supabase.from('sessions').update({ is_live_next: false }).eq('challenge_id', session.challenge_id);
    await patchSession(session.id, { is_live_next: true }, `"${session.title}" pinned as next live`);
  }

  async function uploadPoster(session, file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Please choose an image file', 'error');
    setBusy(true);
    try {
      const small = await compressImage(file);
      const path = `${session.challenge_id}/${session.id}.jpg`;
      const { error } = await supabase.storage.from('posters').upload(path, small, { upsert: true });
      if (error) throw error;
      // Cache-bust so the new image shows immediately after replace.
      const { data } = supabase.storage.from('posters').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await patchSession(session.id, { poster_url: url }, 'Image saved');
      setPosterFor(p => (p && p.id === session.id ? { ...p, poster_url: url } : p));
      setEditingPoster(false);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function createMeetingFor(session) {
    setBusy(true);
    try {
      await createZoomMeeting(session.id);
      toast('Zoom meeting created');
      load();
    } catch (err) {
      toast(err.message || 'Could not create Zoom meeting', 'error');
    } finally {
      setBusy(false);
    }
  }

  function openPoster(session) {
    setPosterFor(session);
    setEditingPoster(!session.poster_url); // jump straight to upload when none yet
    setDragging(false);
  }

  function copyLink(session) {
    const link = session.zoom_join_url || session.zoom_link;
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast('Zoom link copied');
  }

  // Share poster image + title + description + zoom link.
  // Primary: Web Share API with the actual image file (mobile). Fallback: wa.me
  // text with the public poster URL (preview). Last resort: copy message.
  async function shareWhatsApp(session) {
    const link = session.zoom_join_url || session.zoom_link;
    const when = session.scheduled_at
      ? new Date(session.scheduled_at).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
      : '';
    const text = [
      session.title,
      session.description || '',
      when ? `🗓️ ${when}` : '',
      link ? `Join live: ${link}` : '',
    ].filter(Boolean).join('\n\n');

    // Try native share with the image file.
    if (navigator.share && session.poster_url) {
      try {
        const res = await fetch(session.poster_url);
        const blob = await res.blob();
        const file = new File([blob], 'poster.jpg', { type: blob.type || 'image/jpeg' });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: session.title, text });
          return;
        }
      } catch { /* fall through to wa.me */ }
    }

    // Fallback: WhatsApp web with poster URL for the link preview.
    const waText = session.poster_url ? `${text}\n\n${session.poster_url}` : text;
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
  }

  // Replace an existing Zoom link (explicit, confirmed).
  async function regenerateLink(session) {
    if (!confirm('Replace the existing Zoom link? The old link will stop working.')) return;
    setBusy(true);
    try {
      await supabase.from('sessions').update({ zoom_meeting_id: null, zoom_join_url: null, zoom_start_url: null }).eq('id', session.id);
      await createZoomMeeting(session.id);
      toast('New Zoom link created');
      load();
    } catch (err) {
      toast(err.message || 'Could not regenerate', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function generateImage() {
    setAiBusy(true);
    try {
      const url = await generateSessionImage(aiFor.id, aiPrompt);
      toast('Image generated');
      setAiFor(null);
      setAiPrompt('');
      load();
      return url;
    } catch (err) {
      toast(err.message || 'Image generation failed', 'error');
    } finally {
      setAiBusy(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadPoster(posterFor, file);
  }

  async function openAttendance(session) {
    setAttendanceFor(session);
    const [{ data: enr }, { data: existing }, { data: parts }] = await Promise.all([
      supabase.from('enrollments').select('user_id, profiles(full_name, avatar_url)').eq('challenge_id', session.challenge_id),
      supabase.from('attendance').select('user_id').eq('session_id', session.id).eq('attended', true),
      supabase.from('session_participants').select('*').eq('session_id', session.id).is('user_id', null),
    ]);
    setRoster(enr ?? []);
    setMarked(new Set((existing ?? []).map(a => a.user_id)));
    setUnmatched(parts ?? []);
  }

  // Reconcile a Zoom participant that couldn't auto-match to a UniFit user.
  async function reconcile(participantId, userId) {
    if (!userId) return;
    const { error } = await supabase.from('session_participants').update({ user_id: userId }).eq('id', participantId);
    if (error) return toast(error.message, 'error');
    setUnmatched(u => u.filter(p => p.id !== participantId));
    toast('Participant matched — re-runs at next meeting.ended, or mark manually here');
  }

  async function saveAttendance() {
    setBusy(true);
    const rows = roster.map(r => ({
      session_id: attendanceFor.id,
      user_id: r.user_id,
      attended: marked.has(r.user_id),
      marked_by: profile.id,
      source: 'manual',
    }));
    const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'session_id,user_id' });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast(`Attendance saved — ${marked.size}/${roster.length} present`);
    setAttendanceFor(null);
  }

  async function addSession(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const challengeId = add.challenge_id || challenges[0]?.id;
      const isRec = add.type === 'recording';
      const { data: created, error } = await supabase.from('sessions').insert({
        challenge_id: challengeId,
        day_number: +add.day_number,
        title: add.title,
        description: add.description || null,
        category: add.category || null,
        scheduled_at: add.date && add.time ? new Date(`${add.date}T${add.time}`).toISOString() : null,
        duration_minutes: +add.duration_minutes,
        session_type: isRec ? 'recording' : 'live',
        completed: isRec,
        recording_link: isRec ? (add.recording_link || null) : null,
      }).select('id').single();
      if (error) throw error;

      if (add.poster) {
        const small = await compressImage(add.poster);
        const path = `${challengeId}/${created.id}.jpg`;
        const { error: upErr } = await supabase.storage.from('posters').upload(path, small, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('posters').getPublicUrl(path);
        await supabase.from('sessions').update({ poster_url: pub.publicUrl }).eq('id', created.id);
      }

      if (isRec) {
        toast('Recording added');
      } else {
        // Auto-create the Zoom meeting (best-effort).
        try {
          await createZoomMeeting(created.id);
          toast('Session added + Zoom meeting created');
        } catch {
          toast('Session added (Zoom meeting not created — check Zoom secrets)', 'error');
        }
      }
      setShowAdd(false);
      setAdd(freshAdd());
      setAddDragging(false);
      load();
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
        <h1 className="text-2xl md:text-3xl font-bold">Schedule</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary !py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Add session
        </button>
      </div>

      {showAdd && (
        <Card className="p-5 animate-fade-up">
          <form onSubmit={addSession} className="grid gap-3 sm:grid-cols-2">
            {/* Live vs Recording */}
            <div className="sm:col-span-2 inline-flex rounded-lg bg-slate-100 p-0.5 text-sm font-bold">
              {[['live', 'Live (Zoom)'], ['recording', 'Recording']].map(([v, l]) => (
                <button type="button" key={v} onClick={() => setAdd(x => ({ ...x, type: v }))}
                  className={`flex-1 py-2 rounded-md transition-colors duration-150 ${add.type === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{l}</button>
              ))}
            </div>
            <select required className="input" value={add.challenge_id} onChange={e => setAdd(x => ({ ...x, challenge_id: e.target.value }))}>
              <option value="">Select challenge…</option>
              {challenges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required type="number" min="1" placeholder="Day number" className="input" value={add.day_number} onChange={e => setAdd(x => ({ ...x, day_number: e.target.value }))} />
            <select className="input sm:col-span-2" value={add.category} onChange={e => setAdd(x => ({ ...x, category: e.target.value }))} aria-label="Class type">
              {CLASS_TYPES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>
            <input required placeholder="Session title" className="input sm:col-span-2" value={add.title} onChange={e => setAdd(x => ({ ...x, title: e.target.value }))} />
            <textarea placeholder="Description (what's the class about?)" rows="2" className="input sm:col-span-2" value={add.description} onChange={e => setAdd(x => ({ ...x, description: e.target.value }))} />

            <div>
              <label className="label" htmlFor="add-date">{add.type === 'recording' ? 'Posted date' : 'Date'}</label>
              <input id="add-date" required type="date" className="input" value={add.date} onChange={e => setAdd(x => ({ ...x, date: e.target.value }))} />
            </div>
            <div>
              <label className="label" htmlFor="add-time">{add.type === 'recording' ? 'Time' : 'Start time'}</label>
              <input id="add-time" required type="time" className="input" value={add.time} onChange={e => setAdd(x => ({ ...x, time: e.target.value }))} />
            </div>

            {add.type === 'recording' ? (
              <div className="sm:col-span-2">
                <label className="label" htmlFor="add-rec">Recording link</label>
                <input id="add-rec" required type="url" placeholder="Zoom / YouTube / Drive link" className="input" value={add.recording_link} onChange={e => setAdd(x => ({ ...x, recording_link: e.target.value }))} />
              </div>
            ) : (
              <p className="sm:col-span-2 flex items-center gap-2 text-xs text-slate-500">
                <Video className="w-4 h-4 text-sky-500 shrink-0" />
                A Zoom meeting (cloud-recorded, 60 min) is created automatically — no link needed.
              </p>
            )}

            <div className="sm:col-span-2">
              <label className="label">Poster image <span className="font-normal text-slate-400">(rectangle 16:9, optional)</span></label>
              {add.poster ? (
                <div className="relative w-full sm:w-56">
                  <img src={URL.createObjectURL(add.poster)} alt="Poster preview" className="w-full aspect-video object-cover rounded-xl border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setAdd(x => ({ ...x, poster: null }))}
                    aria-label="Remove image"
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-slate-900/70 text-white hover:bg-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  onDragOver={e => { e.preventDefault(); setAddDragging(true); }}
                  onDragLeave={() => setAddDragging(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setAddDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f?.type.startsWith('image/')) setAdd(x => ({ ...x, poster: f }));
                  }}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors duration-200 ${
                    addDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                  }`}
                >
                  <ImagePlus className="w-7 h-7 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    {addDragging ? 'Drop image to attach' : 'Drag & drop an image here'}
                  </span>
                  <span className="text-xs text-slate-400">or click to browse · compressed before upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setAdd(x => ({ ...x, poster: e.target.files?.[0] ?? null }))} />
                </label>
              )}
            </div>

            <button type="submit" disabled={busy} className="btn-primary sm:col-span-2 text-sm">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Create session
            </button>
          </form>
        </Card>
      )}

      {sessions.length === 0 ? (
        <Card><EmptyState icon={Video} title="No sessions yet" hint="Add your first session — it appears on every enrolled member's dashboard." /></Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Card key={s.id} className="p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openPoster(s)}
                  className="group relative shrink-0 rounded-lg overflow-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  aria-label={s.poster_url ? `View or edit Day ${s.day_number} image` : `Add Day ${s.day_number} image`}
                  title={s.poster_url ? 'View / edit image' : 'Add image'}
                >
                  <SessionThumb poster={s.poster_url} day={s.day_number} live={s.is_live_next} />
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 group-hover:bg-slate-900/45 transition-colors duration-200">
                    <ImagePlus className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </span>
                </button>
                <div className="flex-1 min-w-[180px]">
                  <p className="font-bold text-sm flex items-center gap-1.5">
                    <span className="text-brand-500"><CategoryIcon category={s.category} /></span>
                    {s.title}
                  </p>
                  {s.description && <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{s.description}</p>}
                  <p className="mt-0.5 text-xs text-slate-500">
                    {s.challenges?.name} · {s.challenges?.batch_name}
                    {s.scheduled_at && <> · {new Date(s.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</>}
                  </p>
                  <div className="mt-1 flex gap-2">
                    {s.is_live_next && <span className="text-[11px] font-bold text-red-600">PINNED LIVE NEXT</span>}
                    {s.completed && <span className="text-[11px] font-bold text-emerald-600">COMPLETED</span>}
                  </div>
                </div>

                {/* Icon-only action bar (hover = tooltip) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {s.zoom_meeting_id ? (
                    <>
                      {/* Slot booked — link exists, create disabled */}
                      <span title={`Slot booked · Zoom meeting ${s.zoom_meeting_id}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 px-2">
                        <Link2 className="w-3.5 h-3.5" /> Slot booked
                      </span>
                      <IconBtn icon={Copy} label="Copy join link" onClick={() => copyLink(s)} tone="text-sky-500" />
                      <IconBtn icon={Video} label="Start Zoom (host)" href={s.zoom_start_url || s.zoom_join_url} tone="text-sky-500" />
                      <IconBtn icon={RotateCw} label="Regenerate link (replaces old)" onClick={() => regenerateLink(s)} disabled={busy} tone="text-amber-500" />
                    </>
                  ) : (
                    <IconBtn icon={Video} label="Create Zoom link" onClick={() => createMeetingFor(s)} disabled={busy} spinning={busy} tone="text-sky-500" />
                  )}
                  <IconBtn icon={Sparkles} label="Generate AI poster" onClick={() => { setAiFor(s); setAiPrompt(''); }} tone="text-violet-500" />
                  <IconBtn icon={ImagePlus} label="View / edit image" onClick={() => openPoster(s)} tone="text-slate-500" />
                  <IconBtn icon={Share2} label="Share on WhatsApp" onClick={() => shareWhatsApp(s)} tone="text-emerald-500" />
                  {!s.is_live_next && !s.completed && (
                    <IconBtn icon={Radio} label="Pin as next live" onClick={() => setLiveNext(s)} tone="text-red-500" />
                  )}
                  {!s.completed && (
                    <IconBtn icon={CheckCircle2} label="Mark completed"
                      onClick={() => patchSession(s.id, { completed: true, is_live_next: false, session_type: 'recording', recording_link: s.recording_link ?? s.zoom_link }, 'Marked completed')}
                      tone="text-emerald-500" />
                  )}
                  <button onClick={() => openAttendance(s)} title="Mark attendance" aria-label="Mark attendance"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors duration-200">
                    <ClipboardCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Attendance modal */}
      {attendanceFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 md:p-6 max-h-[85vh] overflow-y-auto animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Attendance — Day {attendanceFor.day_number}</h3>
              <button onClick={() => setAttendanceFor(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">{attendanceFor.title}</p>
            <ul className="mt-4 space-y-1.5">
              {roster.map(r => (
                <li key={r.user_id}>
                  <label className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors duration-150">
                    <input
                      type="checkbox"
                      checked={marked.has(r.user_id)}
                      onChange={() => setMarked(m => {
                        const next = new Set(m);
                        next.has(r.user_id) ? next.delete(r.user_id) : next.add(r.user_id);
                        return next;
                      })}
                      className="w-5 h-5 accent-brand-500"
                    />
                    <Avatar name={r.profiles?.full_name} url={r.profiles?.avatar_url} size="w-8 h-8" />
                    <span className="text-sm font-semibold">{r.profiles?.full_name}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={saveAttendance} disabled={busy} className="btn-primary w-full mt-4">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Save ({marked.size}/{roster.length} present)
            </button>

            {/* Unmatched Zoom participants — reconcile to a UniFit member */}
            {unmatched.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-sm text-amber-700">Unmatched Zoom participants ({unmatched.length})</h4>
                <p className="text-xs text-slate-500 mt-0.5">These joined without a matching email. Assign each to a member.</p>
                <ul className="mt-3 space-y-2">
                  {unmatched.map(p => (
                    <li key={p.id} className="flex items-center gap-2">
                      <span className="flex-1 text-sm truncate">
                        {p.zoom_participant_name || p.zoom_participant_email || 'Unknown'}
                      </span>
                      <select
                        defaultValue=""
                        onChange={e => reconcile(p.id, e.target.value)}
                        className="input !py-1.5 !px-2 text-xs w-40"
                        aria-label="Assign participant to member"
                      >
                        <option value="">Assign to…</option>
                        {roster.map(r => (
                          <option key={r.user_id} value={r.user_id}>{r.profiles?.full_name}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Poster view / edit modal */}
      {posterFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-2xl rounded-t-2xl md:rounded-2xl p-5 md:p-6 max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Day {posterFor.day_number} image</h3>
              <button onClick={() => setPosterFor(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">{posterFor.title}</p>

            {/* View mode — large image + Edit/Replace */}
            {!editingPoster && posterFor.poster_url ? (
              <>
                <img
                  src={posterFor.poster_url}
                  alt={`Day ${posterFor.day_number} poster`}
                  className="mt-4 w-full rounded-xl border border-slate-200 object-contain max-h-[60vh] bg-slate-50"
                />
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditingPoster(true)} className="btn-primary flex-1 text-sm">
                    <Upload className="w-4 h-4" /> Replace image
                  </button>
                  <button onClick={() => setPosterFor(null)} className="btn-secondary text-sm">Close</button>
                </div>
              </>
            ) : (
              /* Edit mode — drag & drop or browse */
              <>
                <label
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors duration-200 ${
                    dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                  }`}
                >
                  {busy ? (
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="text-sm font-semibold text-slate-700">
                    {dragging ? 'Drop image to upload' : 'Drag & drop an image here'}
                  </span>
                  <span className="text-xs text-slate-400">or click to browse · rectangle 16:9 · compressed before upload</span>
                  <input
                    type="file" accept="image/*" className="hidden" disabled={busy}
                    onChange={e => uploadPoster(posterFor, e.target.files?.[0])}
                  />
                </label>
                <div className="mt-4 flex gap-2">
                  {posterFor.poster_url && (
                    <button onClick={() => setEditingPoster(false)} className="btn-secondary text-sm">
                      <ImageOff className="w-4 h-4" /> Cancel
                    </button>
                  )}
                  <button onClick={() => setPosterFor(null)} className="btn-secondary text-sm ml-auto">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI image generation modal */}
      {aiFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 md:p-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-500" /> Generate image</h3>
              <button onClick={() => setAiFor(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Uses the title{aiFor.description ? ' + description' : ''} + your prompt to create a 16:9 poster.
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">{aiFor.title}</p>
              {aiFor.description && <p className="mt-0.5">{aiFor.description}</p>}
            </div>
            <textarea
              rows="3" className="input mt-3" placeholder="Extra style, e.g. 'sunrise yoga on a terrace, warm tones'"
              value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
            />
            <button onClick={generateImage} disabled={aiBusy} className="btn-primary w-full mt-3">
              {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiBusy ? 'Generating…' : 'Generate & attach'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
