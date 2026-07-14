import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, PlayCircle, Medal, Users, CheckCircle2, CalendarClock, X, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registerForSession } from '../../lib/zoom';
import { fmtDateTime, fmtCountdown, msUntil } from '../../lib/datetime';
import PaymentSheet from '../../components/PaymentSheet';
import { Card, Spinner, Avatar, EmptyState, SessionThumb, ProgressBar } from '../../components/ui';

const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

export default function ClientSeriesDetail() {
  const { id } = useParams();
  const { profile, session: authSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [board, setBoard] = useState([]);
  const [attMap, setAttMap] = useState({}); // session_id → { attended, attendance_pct }
  const [lightbox, setLightbox] = useState(null); // poster url for image popup
  const [enrolled, setEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null); // { status, access_type, expires_at } | null
  const [fromPrice, setFromPrice] = useState(null);   // cheapest active recorded plan
  const [joining, setJoining] = useState(null); // session id while Zoom registration runs
  const [payOpen, setPayOpen] = useState(false); // enroll-in-place payment sheet
  const [tick, setTick] = useState(0);           // 1s heartbeat for the live countdown

  useEffect(() => {
    (async () => {
      const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).single();
      setChallenge(ch ?? null);
      if (ch?.teacher_id) {
        // Teacher profile may not be readable under RLS — fall back gracefully.
        const { data: t } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', ch.teacher_id).maybeSingle();
        setTeacher(t ?? null);
      }
      const [{ data: ses }, { data: lb }, { data: att }, { data: enr }] = await Promise.all([
        supabase.from('sessions').select('*').eq('challenge_id', id).order('day_number'),
        supabase.from('leaderboard').select('*').eq('challenge_id', id).order('attendance_count', { ascending: false }),
        supabase.from('attendance').select('session_id, attended, attendance_pct').eq('user_id', profile.id),
        supabase.from('enrollments').select('id, status, access_type, expires_at').eq('user_id', profile.id).eq('challenge_id', id).maybeSingle(),
      ]);
      setSessions(ses ?? []);
      setBoard(lb ?? []);
      setEnrolled(!!enr);
      setEnrollment(enr ?? null);
      const m = {};
      for (const a of att ?? []) m[a.session_id] = a;
      setAttMap(m);
      setLoading(false);
    })();
  }, [id, profile.id]);

  // After enrolling (payment success) refresh enrollment + attendance in place.
  async function refreshEnrollment() {
    const [{ data: enr }, { data: att }] = await Promise.all([
      supabase.from('enrollments').select('id, status, access_type, expires_at').eq('user_id', profile.id).eq('challenge_id', id).maybeSingle(),
      supabase.from('attendance').select('session_id, attended, attendance_pct').eq('user_id', profile.id),
    ]);
    setEnrolled(!!enr);
    setEnrollment(enr ?? null);
    const m = {};
    for (const a of att ?? []) m[a.session_id] = a;
    setAttMap(m);
  }

  // While any recording is still processing, poll so it appears without a reload.
  const hasProcessing = sessions.some(s => s.completed && !s.recording_link);
  useEffect(() => {
    if (!hasProcessing) return;
    const t = setInterval(async () => {
      const { data: ses } = await supabase.from('sessions').select('*').eq('challenge_id', id).order('day_number');
      if (ses) setSessions(ses);
    }, 60_000);
    return () => clearInterval(t);
  }, [hasProcessing, id]);

  // 1s heartbeat drives the live countdown to the next session.
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Recorded phase: cheapest active plan for the "from ₹X" prompt.
  useEffect(() => {
    if (challenge?.access_type !== 'recorded') return;
    supabase.from('recorded_plans').select('price').eq('challenge_id', id).eq('is_active', true).order('price').limit(1)
      .then(({ data }) => setFromPrice(data?.[0]?.price ?? null));
  }, [challenge?.access_type, id]);

  if (loading) return <Spinner />;
  if (!challenge) return <EmptyState title="Series not found" />;

  // Per-student progress from attendance.
  const total = sessions.length;
  const attended = sessions.filter(s => attMap[s.id]?.attended).length;

  // Next live session = earliest not-yet-completed live session with a start time.
  void tick; // re-render each second so the countdown updates
  const nextLive = sessions
    .filter(s => !s.completed && s.session_type !== 'recording' && s.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];
  const nextLiveMs = nextLive ? msUntil(nextLive.scheduled_at) : NaN;
  // "Live now" window: from start until start + duration (default 60m).
  const isLiveNow = nextLive && nextLiveMs <= 0 && nextLiveMs > -((nextLive.duration_minutes ?? 60) * 60_000);

  // Free-preview gating: on a paid series, only the first N sessions are open to
  // non-enrolled students; the rest are locked until they enroll.
  const freeCount = challenge.free_session_count ?? 0;
  const recordedPhase = challenge.access_type === 'recorded';
  const active = enrolled && enrollment?.status === 'active';
  const paused = enrolled && enrollment?.status && enrollment.status !== 'active';
  const notExpired = !enrollment?.expires_at || new Date(enrollment.expires_at) > new Date();
  const expiredRecorded = recordedPhase && enrolled && enrollment?.access_type === 'recorded' && !notExpired;
  // Phase gates access. Live phase: any active enrollee. Recorded phase: needs an
  // active, non-expired recorded plan (former live members must buy in).
  const hasAccess = challenge.is_free || (recordedPhase
    ? (active && enrollment?.access_type === 'recorded' && notExpired)
    : active);
  // A session is open when the viewer has access, it's explicitly free, or it
  // falls inside the free-preview count (legacy fallback).
  const isLocked = (idx, s) => !hasAccess && !s?.is_free && idx >= freeCount;
  const lockedSessions = hasAccess ? 0 : sessions.filter((s, idx) => isLocked(idx, s)).length;

  // Status of a single session for THIS student.
  const sessionStatus = s => {
    if (!s.completed) return 'upcoming';
    return attMap[s.id]?.attended ? 'attended' : 'missed';
  };

  // Watching a recording counts as attendance — recorded sessions are valid too.
  // RPC is SECURITY DEFINER so it can insert OR flip a prior "missed" row
  // (clients can't UPDATE attendance directly under RLS).
  async function markAttended(s) {
    if (!enrolled) return; // attendance only counts for enrolled students
    if (attMap[s.id]?.attended) return; // already credited
    setAttMap(m => ({ ...m, [s.id]: { ...(m[s.id] ?? {}), attended: true } })); // optimistic
    let { error } = await supabase.rpc('self_mark_attendance', { p_session: s.id });
    if (error) ({ error } = await supabase.rpc('self_mark_attendance', { p_session: s.id })); // one retry
    if (error) {
      setAttMap(m => ({ ...m, [s.id]: { ...(m[s.id] ?? {}), attended: false } })); // roll back
      toast('Could not record your attendance — please reopen the session', 'error');
    } else {
      toast('Attendance recorded ✓');
    }
  }

  // Open a session: completed recordings play in-app; live classes open Zoom.
  async function openSession(s, idx) {
    if (isLocked(idx, s)) {
      // Enroll right here instead of bouncing back to the list.
      setPayOpen(true);
      return;
    }
    // Recording → in-app player page (also credits attendance there).
    if (s.completed) {
      if (!s.recording_link) { toast('Recording is processing — it will appear here automatically'); return; }
      navigate(`/app/session/${s.id}`);
      return;
    }
    // Live class → join Zoom with the student's identity (name + email), not "guest".
    if (joining) return; // registration already in flight — no double-click double-register
    const fallback = s.zoom_link || s.zoom_join_url;
    if (s.zoom_meeting_id) {
      setJoining(s.id);
      try {
        const url = await registerForSession(s, profile, authSession?.user?.email);
        window.open(url, '_blank', 'noopener');
        return;
      } catch {
        // Be explicit about the degradation instead of silently downgrading.
        toast(fallback
          ? 'Could not get your personal link — joining with the class link. Attendance may not count automatically.'
          : 'Could not get your join link — please try again in a moment', 'error');
      } finally {
        setJoining(null);
      }
    }
    if (!fallback) { if (!s.zoom_meeting_id) toast('Link will be available soon'); return; }
    window.open(fallback, '_blank', 'noopener');
  }

  return (
    <div className="space-y-5">
      <Link to="/app/series" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors duration-200">
        <ArrowLeft className="w-4 h-4" /> All series
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{challenge.name}</h1>
        <p className="mt-2 text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
          {teacher && <span className="inline-flex items-center gap-1.5"><Avatar name={teacher.full_name} url={teacher.avatar_url} size="w-6 h-6" /> {teacher.full_name}</span>}
          {challenge.batch_name && <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> {challenge.batch_name} · {board.length} members</span>}
        </p>
      </div>

      {/* Next live session — countdown, flips to "Live now — Join" at start */}
      {nextLive && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 md:p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
            {isLiveNow ? (
              <span className="inline-flex items-center gap-1.5 bg-red-500 px-3 py-1 rounded-full animate-pulse">
                <Video className="w-3.5 h-3.5" /> Live now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                <CalendarClock className="w-3.5 h-3.5" /> Next live session
              </span>
            )}
          </div>
          <h3 className="mt-3 text-lg md:text-xl font-bold">{nextLive.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{fmtDateTime(nextLive.scheduled_at)} · {nextLive.duration_minutes} min</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {!isLiveNow && <span className="text-2xl font-bold text-brand-400 tabular-nums">Starts {fmtCountdown(nextLive.scheduled_at)}</span>}
            <button
              onClick={() => openSession(nextLive, sessions.indexOf(nextLive))}
              className={`btn-primary ${isLiveNow ? 'animate-pulse' : ''}`}
              disabled={joining === nextLive.id}
            >
              {joining === nextLive.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
              {isLiveNow ? 'Join live session' : 'Open join link'}
            </button>
          </div>
        </div>
      )}

      {/* Your progress — per-student, attendance driven (enrolled only) */}
      {enrolled && total > 0 && (
        <Card className="p-5 md:p-6">
          <h2 className="font-bold text-lg">Your progress</h2>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={attended} max={total} className="flex-1" />
            <span className="text-sm font-bold text-slate-900 shrink-0">{attended}/{total}<span className="text-slate-400 font-semibold"> attended</span></span>
          </div>
        </Card>
      )}

      {/* Active recorded member — show remaining access window */}
      {hasAccess && recordedPhase && enrollment?.access_type === 'recorded' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl px-3.5 py-2">
          <PlayCircle className="w-4 h-4" /> Recorded access {enrollment.expires_at ? `until ${fmtDateTime(enrollment.expires_at, { withYear: true })}` : '· Lifetime'}
        </div>
      )}

      {/* Paused / removed — access revoked until they pay again */}
      {paused && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
          <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-900">{enrollment?.status === 'removed' ? 'You were removed from this series' : 'Your access is paused'}</p>
            <p className="text-xs text-red-800">Make the payment to continue watching the sessions.</p>
          </div>
          <button onClick={() => setPayOpen(true)} className="btn-primary !py-2 !px-3 text-xs shrink-0">
            {recordedPhase ? 'Choose a plan' : `Pay${!challenge.is_free ? ` · ₹${challenge.price}` : ''}`}
          </button>
        </div>
      )}

      {/* Recorded expired — renew a plan */}
      {!paused && expiredRecorded && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
          <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-900">Your recorded access expired</p>
            <p className="text-xs text-red-800">Renew a plan to keep watching these recordings.</p>
          </div>
          <button onClick={() => setPayOpen(true)} className="btn-primary !py-2 !px-3 text-xs shrink-0">Renew{fromPrice != null && ` · from ₹${fromPrice}`}</button>
        </div>
      )}

      {/* Recorded phase, no active plan (incl. former live members) — must buy in */}
      {!paused && !expiredRecorded && recordedPhase && !hasAccess && (
        <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3.5">
          <Lock className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-violet-900">This series is now recordings-only</p>
            <p className="text-xs text-violet-800">Choose a plan to watch the recordings{fromPrice != null && ` — from ₹${fromPrice}`}.</p>
          </div>
          <button onClick={() => setPayOpen(true)} className="btn-primary !py-2 !px-3 text-xs shrink-0">Choose a plan</button>
        </div>
      )}

      {/* Live phase free-preview banner for non-enrolled students */}
      {!paused && !recordedPhase && !hasAccess && lockedSessions > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-900">{freeCount > 0 ? `Your first ${freeCount} session${freeCount === 1 ? '' : 's'} ${freeCount === 1 ? 'is' : 'are'} free` : 'Free preview'}</p>
            <p className="text-xs text-amber-800">Watch free, then enroll to unlock all {total} sessions{!challenge.is_free && ` — ₹${challenge.price}`}.</p>
          </div>
          <button onClick={() => setPayOpen(true)} className="btn-primary !py-2 !px-3 text-xs shrink-0">
            Enroll{!challenge.is_free && ` · ₹${challenge.price}`}
          </button>
        </div>
      )}

      <div className={`grid gap-5 ${recordedPhase ? '' : 'lg:grid-cols-3'}`}>
        {/* Sessions */}
        <Card className={`p-5 md:p-6 min-w-0 ${recordedPhase ? '' : 'lg:col-span-2'}`}>
          <h2 className="font-bold text-lg">Sessions</h2>
          {sessions.length === 0 ? (
            <EmptyState icon={Video} title="Sessions coming soon" />
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {sessions.map((s, idx) => {
                const st = sessionStatus(s);
                const locked = isLocked(idx, s);
                const isFreePreview = !hasAccess && !locked;
                const hasLink = s.completed ? !!s.recording_link : !!(s.zoom_link || s.zoom_join_url);
                return (
                <li
                  key={s.id}
                  onClick={() => openSession(s, idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSession(s, idx); } }}
                  className={`flex items-start gap-3 py-3 -mx-2 px-2 rounded-xl cursor-pointer transition-colors duration-150 group ${locked ? 'opacity-60 hover:bg-amber-50' : 'hover:bg-brand-50/60 hover:ring-1 hover:ring-brand-100'}`}
                >
                  {/* Thumb → tap to enlarge (only when there's a real poster + not locked) */}
                  <button
                    type="button"
                    onClick={e => { if (s.poster_url && !locked) { e.stopPropagation(); setLightbox(s.poster_url); } }}
                    className="shrink-0"
                    aria-label={s.poster_url && !locked ? 'View image' : undefined}
                    tabIndex={s.poster_url && !locked ? 0 : -1}
                  >
                    <SessionThumb poster={locked ? null : s.poster_url} day={s.day_number} live={s.is_live_next} size="w-16 h-10" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm group-hover:text-brand-600 flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{s.title}</span>
                          {!locked && st === 'attended' && <CheckCircle2 className="w-4 h-4 shrink-0 fill-emerald-500 text-white" />}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {!recordedPhase && s.scheduled_at && <>{fmtDateTime(s.scheduled_at)} · </>}
                          {s.duration_minutes} min
                          {s.is_live_next && <span className="ml-2 font-bold text-red-600">NEXT LIVE</span>}
                        </p>
                      </div>
                      {/* Affordance — whole row is clickable. Play icon hidden on
                          mobile (tap the card to play); lock/soon stay visible. */}
                      <span className="shrink-0 text-slate-300 group-hover:text-brand-500">
                        {locked
                          ? <Lock className="w-5 h-5 text-amber-400" />
                          : joining === s.id
                            ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                            : hasLink
                              ? (s.completed ? <PlayCircle className="w-5 h-5 hidden sm:block" /> : <Video className="w-5 h-5 hidden sm:block" />)
                              : <span className="text-[11px] text-slate-400">{s.completed ? (s.recording_status === 'processing' ? 'Processing…' : '—') : 'Soon'}</span>}
                      </span>
                    </div>
                    {/* Preview / lock tags. Attended shows as a tick by the title;
                        Missed is dropped. Upcoming only makes sense in the live phase. */}
                    {(locked || isFreePreview || (!recordedPhase && st === 'upcoming')) && (
                      <div className="mt-1.5">
                        {locked && <StatusPill icon={Lock} tone="bg-amber-100 text-amber-700">Locked · enroll to unlock</StatusPill>}
                        {isFreePreview && <StatusPill icon={PlayCircle} tone="bg-emerald-100 text-emerald-700">Free preview</StatusPill>}
                        {!locked && !recordedPhase && st === 'upcoming' && <StatusPill icon={CalendarClock} tone="bg-sky-100 text-sky-700">Upcoming</StatusPill>}
                      </div>
                    )}
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Leaderboard — live series only; recordings have no live consistency race */}
        {!recordedPhase && (
        <Card className="p-5 md:p-6 min-w-0">
          <h2 className="font-bold text-lg">Consistency Leaderboard</h2>
          <p className="text-xs text-slate-500 mt-1">Ranked by sessions attended — showing up is the win.</p>
          {board.length === 0 ? (
            <EmptyState icon={Medal} title="No attendance yet" />
          ) : (
            <ol className="mt-4 space-y-2.5">
              {board.map((row, i) => (
                <li
                  key={row.user_id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    row.user_id === profile.id ? 'bg-brand-50 border border-brand-200' : ''
                  }`}
                >
                  <span className="w-6 text-center">
                    {i < 3
                      ? <Medal className={`w-5 h-5 inline ${MEDAL_COLORS[i]}`} />
                      : <span className="text-sm font-bold text-slate-400">{i + 1}</span>}
                  </span>
                  <Avatar name={row.full_name} url={row.avatar_url} size="w-8 h-8" />
                  <span className="flex-1 text-sm font-semibold truncate">
                    {row.full_name}{row.user_id === profile.id && ' (you)'}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{row.attendance_count}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
        )}
      </div>

      {/* Image lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog" aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <button onClick={() => setLightbox(null)} aria-label="Close" className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          <img src={lightbox} alt="Session" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {payOpen && (
        <PaymentSheet
          series={challenge}
          profile={profile}
          email={authSession?.user?.email}
          onClose={() => setPayOpen(false)}
          onEnrolled={() => { setPayOpen(false); refreshEnrollment(); }}
        />
      )}
    </div>
  );
}

function StatusPill({ icon: Icon, tone, children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${tone}`}>
      <Icon className="w-3 h-3" /> {children}
    </span>
  );
}
