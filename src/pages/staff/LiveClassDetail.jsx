import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Users, Copy, Video, CalendarX, CalendarCheck, ClipboardCheck, Star, StopCircle, Link2, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fmtDateTime } from '../../lib/datetime';
import { fmtSchedule, classState } from '../../lib/liveClass';
import { Card, Spinner, EmptyState, Avatar, StatCard, CategoryIcon } from '../../components/ui';
import LiveClassForm from '../../components/LiveClassForm';
import RosterPicker from '../../components/RosterPicker';
import AttendanceSheet from '../../components/AttendanceSheet';

const HISTORY_DAYS = 30;

// One live class: schedule + join link, roster, upcoming calendar (cancel a
// date) and past classes (attendance, remarks, and — for its teachers only —
// students' private ratings). Shared by /teacher/live/:id and /admin/live/:id.
export default function LiveClassDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { profile } = useAuth();
  const isAdmin = profile.role === 'admin';
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [c, setC] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [roster, setRoster] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [tab, setTab] = useState('past');
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    const since = new Date(Date.now() - HISTORY_DAYS * 86400_000).toISOString();
    const [{ data: ch }, { data: ses }, { data: ros }, { data: t }] = await Promise.all([
      supabase.from('challenges').select('*').eq('id', id).maybeSingle(),
      supabase.from('sessions').select('*').eq('challenge_id', id).gte('scheduled_at', since).order('scheduled_at'),
      supabase.rpc('series_roster', { p_challenge: id }),
      isAdmin ? supabase.from('profiles').select('id, full_name').eq('role', 'teacher').order('full_name') : Promise.resolve({ data: [] }),
    ]);
    const sids = (ses ?? []).map(s => s.id);
    // Ratings are teacher-only: RLS returns nothing to admins, so don't ask.
    const [{ data: att }, { data: fb }] = sids.length
      ? await Promise.all([
          supabase.from('attendance').select('session_id, user_id, attended').in('session_id', sids),
          isAdmin ? Promise.resolve({ data: [] }) : supabase.from('session_feedback').select('session_id, user_id, rating').in('session_id', sids),
        ])
      : [{ data: [] }, { data: [] }];
    setC(ch);
    setSessions(ses ?? []);
    setRoster(ros ?? []);
    setTeachers(t ?? []);
    setAttendance(att ?? []);
    setFeedback(fb ?? []);
    setLoading(false);
  }, [id, isAdmin]);
  useEffect(() => { load(); }, [load]);

  // Deep links from notifications / class creation: ?session=<id>, ?roster=1.
  const openSessionId = params.get('session');
  const rosterOpen = params.get('roster') === '1';
  const closeParam = key => setParams(p => { p.delete(key); return p; }, { replace: true });
  const openParam = (key, value) => setParams(p => { p.set(key, value); return p; }, { replace: true });

  async function toggleCancelled(s) {
    const { error } = await supabase.from('sessions').update({ is_cancelled: !s.is_cancelled }).eq('id', s.id);
    if (error) return toast(error.message, 'error');
    toast(s.is_cancelled ? 'Class restored' : 'Class cancelled for that day');
    load();
  }

  async function endClass() {
    if (!confirm(`End "${c.name}"? No more classes will be scheduled. History is kept.`)) return;
    const { error } = await supabase.rpc('end_live_class', { p_id: id });
    if (error) return toast(error.message, 'error');
    toast('Class ended');
    load();
  }

  function copyLink() {
    navigator.clipboard.writeText(c.recur_join_link);
    toast('Join link copied');
  }

  if (loading) return <Spinner />;
  if (!c?.is_recurring) return <EmptyState title="Class not found" />;

  const backTo = isAdmin ? '/admin/live' : '/teacher/live';
  const ended = c.status === 'completed';
  const now = Date.now();
  const past = sessions.filter(s => classState(s, now) === 'ended' || (s.is_cancelled && new Date(s.scheduled_at) < now)).reverse();
  const upcoming = sessions.filter(s => !past.includes(s));
  const held = past.filter(s => !s.is_cancelled);
  const marked = new Set(attendance.map(a => a.session_id));
  const sheetSession = sessions.find(s => s.id === openSessionId);

  const presentIn = sid => attendance.filter(a => a.session_id === sid && a.attended).length;
  const ratingsFor = pred => feedback.filter(pred).map(f => f.rating);
  const avg = list => (list.length ? (list.reduce((a, b) => a + b, 0) / list.length).toFixed(1) : null);
  const heldIds = new Set(held.map(s => s.id));
  const heldAttendance = attendance.filter(a => heldIds.has(a.session_id));
  const attendancePct = heldAttendance.length
    ? Math.round((heldAttendance.filter(a => a.attended).length / heldAttendance.length) * 100)
    : null;
  const studentStats = uid => ({
    attended: heldAttendance.filter(a => a.user_id === uid && a.attended).length,
    rating: avg(ratingsFor(f => f.user_id === uid)),
  });

  return (
    <div className="space-y-5">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> All live classes</Link>

      {/* Header */}
      <Card className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <CategoryIcon category={c.recur_category} className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{c.name}</h1>
                {ended && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Ended</span>}
              </div>
              <p className="mt-1 text-sm text-slate-600">{fmtSchedule(c, { withTz: true })}</p>
              <p className="text-xs text-slate-500">From {c.start_date}{c.recur_until ? ` to ${c.recur_until}` : ' · no end date'}</p>
              {c.description && <p className="mt-2 text-sm text-slate-600">{c.description}</p>}
            </div>
          </div>
          {!ended && (
            <div className="flex gap-2 shrink-0">
              <button onClick={endClass} className="btn-secondary !py-2 !px-3 text-sm text-red-600"><StopCircle className="w-4 h-4" /> End</button>
              <button onClick={() => setEditing(true)} className="btn-primary !py-2 !px-3 text-sm"><Pencil className="w-4 h-4" /> Edit</button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
          {c.recur_join_link ? (
            <>
              <span className="flex-1 min-w-0 truncate text-sm text-slate-700">{c.recur_join_link}</span>
              <button onClick={copyLink} title="Copy join link" aria-label="Copy join link" className="p-1.5 rounded-lg hover:bg-white"><Copy className="w-4 h-4 text-sky-500" /></button>
              <a href={c.recur_join_link} target="_blank" rel="noreferrer" title="Open link" aria-label="Open join link" className="p-1.5 rounded-lg hover:bg-white"><Video className="w-4 h-4 text-sky-500" /></a>
            </>
          ) : (
            <span className="flex-1 text-sm text-amber-700 inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> No join link yet — students can't join. Add it via Edit.</span>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Students" value={roster.length} onClick={ended ? undefined : () => openParam('roster', '1')} />
        <StatCard icon={CalendarCheck} label={`Held · ${HISTORY_DAYS}d`} value={held.length} accent="text-sky-500" />
        <StatCard icon={ClipboardCheck} label="Attendance" value={attendancePct == null ? '—' : `${attendancePct}%`} accent="text-emerald-500" />
        {!isAdmin && <StatCard icon={Star} label="Avg rating" value={avg(ratingsFor(() => true)) ?? '—'} accent="text-amber-400" />}
      </div>

      {/* Roster */}
      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-brand-500" /> Students ({roster.length})</h2>
          {!ended && <button onClick={() => openParam('roster', '1')} className="btn-secondary !py-2 text-sm"><Pencil className="w-4 h-4" /> Manage</button>}
        </div>
        {roster.length === 0 ? (
          <EmptyState icon={Users} title="No students yet" hint="Pick the regular students — only they see this class and get its prompts." />
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {roster.map(r => {
              const st = studentStats(r.user_id);
              return (
                <li key={r.user_id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <Avatar name={r.full_name} url={r.avatar_url} size="w-9 h-9" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.full_name}</p>
                    <p className="text-xs text-slate-500">{st.attended}/{held.length} attended</p>
                  </div>
                  {st.rating && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {st.rating}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Calendar */}
      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-lg">Classes</h2>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm font-bold">
            {[['past', `Past (${past.length})`], ['upcoming', `Upcoming (${upcoming.length})`]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} className={`px-3 py-1.5 rounded-md ${tab === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{l}</button>
            ))}
          </div>
        </div>

        {tab === 'past' ? (
          past.length === 0 ? <EmptyState icon={CalendarCheck} title="No classes held yet" /> : (
            <ul className="mt-4 divide-y divide-slate-100">
              {past.map(s => {
                const done = marked.has(s.id);
                const rating = avg(ratingsFor(f => f.session_id === s.id));
                return (
                  <li key={s.id} className={`flex items-center gap-3 py-3 ${s.is_cancelled ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{fmtDateTime(s.scheduled_at)}</p>
                      <p className="text-xs text-slate-500">
                        Day {s.day_number}
                        {s.is_cancelled ? ' · Cancelled' : done ? ` · ${presentIn(s.id)}/${roster.length} present` : ' · Attendance not marked'}
                      </p>
                    </div>
                    {rating && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rating}</span>}
                    {!s.is_cancelled && (
                      <button onClick={() => openParam('session', s.id)}
                        className={`${done ? 'btn-secondary' : 'btn-primary'} !py-1.5 !px-3 text-xs shrink-0`}>
                        <ClipboardCheck className="w-4 h-4" /> {done ? 'View' : 'Mark'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          upcoming.length === 0 ? <EmptyState icon={CalendarX} title={ended ? 'This class has ended' : 'Nothing scheduled'} /> : (
            <ul className="mt-4 divide-y divide-slate-100">
              {upcoming.map(s => {
                const state = classState(s, now);
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${s.is_cancelled ? 'line-through text-slate-400' : ''}`}>{fmtDateTime(s.scheduled_at)}</p>
                      <p className="text-xs text-slate-500">
                        Day {s.day_number}
                        {state === 'live' && <span className="ml-1.5 font-bold text-red-600">· Live now</span>}
                        {s.is_cancelled && ' · Cancelled'}
                      </p>
                    </div>
                    {state !== 'live' && (
                      <button onClick={() => toggleCancelled(s)} className="btn-secondary !py-1.5 !px-3 text-xs shrink-0">
                        {s.is_cancelled ? <><CalendarCheck className="w-4 h-4 text-emerald-500" /> Restore</> : <><CalendarX className="w-4 h-4 text-red-500" /> Cancel</>}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )
        )}
      </Card>

      {editing && (
        <LiveClassForm initial={c} isAdmin={isAdmin} teachers={teachers} onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); load(); }} />
      )}
      {rosterOpen && <RosterPicker challengeId={id} onClose={() => closeParam('roster')} onSaved={load} />}
      {sheetSession && (
        <AttendanceSheet session={sheetSession} withRemarks showFeedback={!isAdmin}
          onClose={() => closeParam('session')} onSaved={load} />
      )}
    </div>
  );
}
