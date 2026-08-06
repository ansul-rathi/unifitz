import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, PlayCircle, CheckCircle2, Megaphone,
  CalendarClock, Radio, Gift, ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registerForSession } from '../../lib/zoom';
import { fmtDateTime } from '../../lib/datetime';
import { Card, Spinner, CountdownTimer, SessionThumb } from '../../components/ui';
import DailyCheckin from '../../components/DailyCheckin';

// Local calendar date — toISOString() would roll the day over at UTC midnight,
// which is the wrong day for anyone not on UTC.
const todayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

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

    // A pinned session that's already done (completed or has a recording) is no
    // longer "next" — drop it from the top highlight.
    const live = (sessions ?? []).find(s => s.is_live_next && !s.completed && !s.recording_link);
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

      {/* Daily check-in — quick self-report of the habits that add up */}
      <DailyCheckin profile={profile} checkin={checkin} onSaved={setCheckin} />

      {/* Weekly check-in reminder — temporarily hidden for students. */}

      {/* Pinned live session — hidden entirely when nothing is pinned */}
      {liveSession && (
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
              {fmtDateTime(liveSession.scheduled_at)}
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
      )}

      {/* Today's check-in — temporarily hidden for students (moved to EOD flow). */}

      {/* Recordings — hidden entirely when there are none */}
      {recordings.length > 0 && (
      <Card className="p-5 md:p-6">
        <h3 className="font-bold text-lg">Recordings</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {recordings.map(s => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <SessionThumb poster={s.poster_url} day={s.day_number} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.challenges?.name} · {s.duration_minutes} min</p>
                </div>
                {watched.has(s.id) && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                {s.recording_link ? (
                  <Link
                    to={`/app/session/${s.id}`}
                    onClick={() => markWatched(s.id)}
                    className="btn-secondary !py-2 !px-3.5 text-xs shrink-0"
                  >
                    <PlayCircle className="w-4 h-4" /> Watch
                  </Link>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {s.recording_status === 'processing' ? 'Recording soon' : 'No recording'}
                  </span>
                )}
              </li>
            ))}
          </ul>
      </Card>
      )}

      {/* Refer & Earn — mobile only; the desktop sidebar already links to it */}
      <Link
        to="/app/refer"
        className="lg:hidden flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 active:scale-[0.99] transition"
      >
        <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-sm shadow-orange-500/30">
          <Gift className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800">Refer &amp; Earn</p>
          <p className="text-xs font-semibold text-slate-500">Invite a friend, get rewarded</p>
        </div>
        <ChevronRight className="w-5 h-5 text-orange-400 shrink-0" />
      </Link>
    </div>
  );
}
