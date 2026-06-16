import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, PlayCircle, CheckCircle2, Megaphone, GlassWater, Moon,
  CalendarClock, ClipboardList, Radio,
} from 'lucide-react';
import { Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registerForSession } from '../../lib/zoom';
import { nearestBadges } from '../../lib/badges';
import { Card, Spinner, EmptyState, CountdownTimer, SessionThumb, ProgressBar } from '../../components/ui';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ClientHome() {
  const { profile, session: authSession } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [liveSession, setLiveSession] = useState(null);
  const [joinUrl, setJoinUrl] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [weeklyDue, setWeeklyDue] = useState(false);
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [nudges, setNudges] = useState([]);
  const [watched, setWatched] = useState(() => new Set(JSON.parse(localStorage.getItem('uf_watched') || '[]')));

  const load = useCallback(async () => {
    const { data: enr } = await supabase.from('enrollments').select('challenge_id').eq('user_id', profile.id);
    const ids = (enr ?? []).map(e => e.challenge_id);
    if (!ids.length) {
      setLoading(false);
      return;
    }

    const [{ data: sessions }, { data: anns }, { data: chk }, { data: weekly }] = await Promise.all([
      supabase.from('sessions').select('*, challenges(name, batch_name, teacher_id)').in('challenge_id', ids).order('day_number', { ascending: false }),
      supabase.from('announcements').select('*').in('challenge_id', ids).order('created_at', { ascending: false }).limit(1),
      supabase.from('daily_checkins').select('*').eq('user_id', profile.id).eq('checkin_date', todayStr()).maybeSingle(),
      supabase.from('weekly_checkins').select('created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(1),
    ]);

    const live = (sessions ?? []).find(s => s.is_live_next);
    setLiveSession(live ?? null);
    if (live?.scheduled_at) setIsLiveNow(new Date(live.scheduled_at) <= new Date());
    setRecordings((sessions ?? []).filter(s => s.session_type === 'recording' || s.completed));
    setAnnouncement(anns?.[0] ?? null);
    setCheckin(chk ?? null);
    const last = weekly?.[0]?.created_at;
    setWeeklyDue(!last || (Date.now() - new Date(last)) > 7 * 86400_000);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  // "You're close!" badge nudges.
  useEffect(() => {
    nearestBadges(profile.id).then(setNudges);
  }, [profile.id]);

  // Realtime: new announcements + live-session flips arrive without refresh.
  useEffect(() => {
    const channel = supabase
      .channel('client-home')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
        setAnnouncement(payload.new);
        toast('New announcement from your trainer');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions' }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [load, toast]);

  async function saveCheckin(patch) {
    const base = checkin ?? { user_id: profile.id, checkin_date: todayStr(), attended_session: false, water_glasses: 0, sleep_hours: null };
    const next = { ...base, ...patch };
    setCheckin(next);
    const { error } = await supabase.from('daily_checkins').upsert(
      { user_id: profile.id, checkin_date: todayStr(), attended_session: next.attended_session, water_glasses: next.water_glasses, sleep_hours: next.sleep_hours },
      { onConflict: 'user_id,checkin_date' }
    );
    if (error) toast(error.message, 'error');
  }

  function markWatched(id) {
    const next = new Set(watched);
    next.add(id);
    setWatched(next);
    localStorage.setItem('uf_watched', JSON.stringify([...next]));
  }

  // When a Zoom meeting exists, register the student → personal identity-bound
  // join URL so the webhook can match join/leave events to this user.
  useEffect(() => {
    let cancelled = false;
    const email = authSession?.user?.email;
    if (liveSession?.zoom_meeting_id && email) {
      registerForSession(liveSession, profile, email)
        .then(url => { if (!cancelled) setJoinUrl(url); })
        .catch(() => { if (!cancelled) setJoinUrl(liveSession.zoom_join_url ?? liveSession.zoom_link ?? null); });
    } else {
      setJoinUrl(liveSession?.zoom_join_url ?? liveSession?.zoom_link ?? null);
    }
    return () => { cancelled = true; };
  }, [liveSession?.id, liveSession?.zoom_meeting_id, authSession?.user?.email, profile]);

  // Joining the live class. With a Zoom meeting, attendance comes from the
  // webhook (join/leave → %). For pure manual sessions, fall back to self-mark.
  function joinLive() {
    if (!liveSession) return;
    saveCheckin({ attended_session: true }); // streak credit either way
    if (!liveSession.zoom_meeting_id) {
      supabase.from('attendance').upsert(
        { session_id: liveSession.id, user_id: profile.id, attended: true, marked_by: profile.id, source: 'manual' },
        { onConflict: 'session_id,user_id', ignoreDuplicates: true }
      ).then(({ error }) => { if (!error) toast('Marked present — enjoy the class!'); });
    } else {
      toast('Enjoy the class! Attendance is tracked automatically.');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Hi {profile.full_name.split(' ')[0]}, ready to move?</h1>

      {/* Announcement banner */}
      {announcement && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 animate-fade-up">
          <Megaphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">{announcement.message}</p>
        </div>
      )}

      {/* Weekly form due */}
      {weeklyDue && (
        <Link to="/app/progress" className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 hover:bg-violet-100 transition-colors duration-200">
          <ClipboardList className="w-5 h-5 text-violet-600 shrink-0" />
          <p className="text-sm font-semibold text-violet-900 flex-1">Your weekly check-in is due — it takes 2 minutes</p>
          <span className="text-xs font-bold text-violet-600">Fill now →</span>
        </Link>
      )}

      {/* "You're close!" badge nudges */}
      {nudges.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> You're close!</h3>
          <div className="mt-3 space-y-3">
            {nudges.map(n => {
              const remaining = Math.max(0, Math.ceil(n.remaining));
              const cur = Number(n.current), thr = Number(n.threshold);
              return (
                <div key={n.code}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{remaining} more → {n.name}</span>
                    <span className="text-xs text-slate-400">{Math.round(cur)}/{Math.round(thr)}</span>
                  </div>
                  <ProgressBar value={cur} max={thr} className="mt-1.5" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Pinned live session */}
      {liveSession ? (
        <Card className="overflow-hidden">
          {liveSession.poster_url && (
            <img src={liveSession.poster_url} alt={liveSession.title} className="w-full aspect-video object-cover" />
          )}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              {isLiveNow ? (
                <span className="inline-flex items-center gap-1.5 bg-red-500 px-3 py-1 rounded-full animate-pulse-glow">
                  <Radio className="w-3.5 h-3.5" /> LIVE NOW
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                  <CalendarClock className="w-3.5 h-3.5" /> Next live session
                </span>
              )}
              <span className="text-slate-300">{liveSession.challenges?.name}</span>
            </div>
            <h2 className="mt-3 text-xl md:text-2xl font-bold text-white">{liveSession.title}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {new Date(liveSession.scheduled_at).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
              {' · '}{liveSession.duration_minutes} min
            </p>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
              {!isLiveNow && liveSession.scheduled_at && (
                <span className="text-2xl text-brand-400">
                  <CountdownTimer target={liveSession.scheduled_at} onZero={() => setIsLiveNow(true)} />
                </span>
              )}
              {(() => {
                const link = joinUrl || liveSession.zoom_join_url || liveSession.zoom_link;
                return link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={joinLive}
                    className={`btn-primary ${isLiveNow ? 'animate-pulse-glow' : ''}`}
                  >
                    <Video className="w-5 h-5" />
                    {isLiveNow ? 'Join Live Session' : 'Open Zoom Link'}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-white/10 text-slate-300 font-bold px-5 py-3 rounded-xl text-sm cursor-not-allowed">
                    <Video className="w-5 h-5" />
                    Link not ready yet
                  </span>
                );
              })()}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState icon={CalendarClock} title="No live session pinned yet"
            hint="Your trainer will pin the next live class here. Browse challenges to get enrolled." />
        </Card>
      )}

      {/* Daily check-in widget */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">Today's check-in</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <button
            onClick={() => saveCheckin({ attended_session: !checkin?.attended_session })}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 font-bold text-sm transition-colors duration-200 ${
              checkin?.attended_session
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 text-slate-600 hover:border-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {checkin?.attended_session ? 'Attended today' : 'I attended today'}
          </button>

          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-3">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => saveCheckin({ water_glasses: i + 1 === checkin?.water_glasses ? i : i + 1 })}
                aria-label={`${i + 1} glasses of water`}
                className="transition-transform duration-150 hover:scale-110"
              >
                <GlassWater className={`w-5 h-5 ${i < (checkin?.water_glasses ?? 0) ? 'text-sky-500 fill-sky-100' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5">
            <Moon className="w-5 h-5 text-violet-500 shrink-0" />
            <label htmlFor="sleep" className="text-sm font-semibold text-slate-600 shrink-0">Sleep</label>
            <input
              id="sleep" type="number" min="0" max="14" step="0.5"
              value={checkin?.sleep_hours ?? ''}
              onChange={e => saveCheckin({ sleep_hours: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full text-right font-bold text-slate-900 outline-none"
              placeholder="7"
            />
            <span className="text-sm text-slate-400">hrs</span>
          </div>
        </div>
      </Card>

      {/* Session queue */}
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">Recordings</h3>
        {recordings.length === 0 ? (
          <EmptyState icon={PlayCircle} title="No recordings yet" hint="Past class recordings appear here once your challenge starts." />
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {recordings.map(s => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <SessionThumb poster={s.poster_url} day={s.day_number} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.challenges?.name} · {s.duration_minutes} min</p>
                </div>
                {watched.has(s.id) && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                <a
                  href={s.recording_link || s.zoom_link || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => markWatched(s.id)}
                  className="btn-secondary !py-2 !px-3.5 text-xs shrink-0"
                >
                  <PlayCircle className="w-4 h-4" /> Watch
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
