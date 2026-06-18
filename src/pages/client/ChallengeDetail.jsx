import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Video, PlayCircle, Medal, Users, CheckCircle2, XCircle, CalendarClock, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, Avatar, EmptyState, SessionThumb, ProgressBar } from '../../components/ui';

const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

export default function ChallengeDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [board, setBoard] = useState([]);
  const [attMap, setAttMap] = useState({}); // session_id → { attended, attendance_pct }
  const [lightbox, setLightbox] = useState(null); // poster url for image popup

  useEffect(() => {
    (async () => {
      const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).single();
      setChallenge(ch ?? null);
      if (ch?.teacher_id) {
        // Teacher profile may not be readable under RLS — fall back gracefully.
        const { data: t } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', ch.teacher_id).maybeSingle();
        setTeacher(t ?? null);
      }
      const [{ data: ses }, { data: lb }, { data: att }] = await Promise.all([
        supabase.from('sessions').select('*').eq('challenge_id', id).order('day_number'),
        supabase.from('leaderboard').select('*').eq('challenge_id', id).order('attendance_count', { ascending: false }),
        supabase.from('attendance').select('session_id, attended, attendance_pct').eq('user_id', profile.id),
      ]);
      setSessions(ses ?? []);
      setBoard(lb ?? []);
      const m = {};
      for (const a of att ?? []) m[a.session_id] = a;
      setAttMap(m);
      setLoading(false);
    })();
  }, [id, profile.id]);

  if (loading) return <Spinner />;
  if (!challenge) return <EmptyState title="Series not found" />;

  // Per-student progress from attendance.
  const total = sessions.length;
  const attended = sessions.filter(s => attMap[s.id]?.attended).length;

  // Status of a single session for THIS student.
  const sessionStatus = s => {
    if (!s.completed) return 'upcoming';
    return attMap[s.id]?.attended ? 'attended' : 'missed';
  };

  // Watching a recording counts as attendance — recorded sessions are valid too.
  // RPC is SECURITY DEFINER so it can insert OR flip a prior "missed" row
  // (clients can't UPDATE attendance directly under RLS).
  async function markAttended(s) {
    if (attMap[s.id]?.attended) return; // already credited
    setAttMap(m => ({ ...m, [s.id]: { ...(m[s.id] ?? {}), attended: true } })); // optimistic
    const { error } = await supabase.rpc('self_mark_attendance', { p_session: s.id });
    if (error) toast(error.message, 'error');
  }

  // Open a session: recording when completed (also credits attendance), else the live link.
  function openSession(s) {
    const link = s.completed ? s.recording_link : (s.zoom_link || s.zoom_join_url);
    if (!link) {
      toast(s.completed ? 'Recording not ready yet' : 'Link will be available soon');
      return;
    }
    if (s.completed) markAttended(s); // watching the recording = attended
    window.open(link, '_blank', 'noopener');
  }

  return (
    <div className="space-y-5">
      <Link to="/app/challenges" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors duration-200">
        <ArrowLeft className="w-4 h-4" /> All series
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{challenge.name}</h1>
        <p className="mt-2 text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
          {teacher && <span className="inline-flex items-center gap-1.5"><Avatar name={teacher.full_name} url={teacher.avatar_url} size="w-6 h-6" /> {teacher.full_name}</span>}
          {challenge.batch_name && <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> {challenge.batch_name} · {board.length} members</span>}
        </p>
      </div>

      {/* Your progress — per-student, attendance driven */}
      {total > 0 && (
        <Card className="p-5 md:p-6">
          <h2 className="font-bold text-lg">Your progress</h2>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={attended} max={total} className="flex-1" />
            <span className="text-sm font-bold text-slate-900 shrink-0">{attended}/{total}<span className="text-slate-400 font-semibold"> attended</span></span>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sessions */}
        <Card className="p-5 md:p-6 lg:col-span-2">
          <h2 className="font-bold text-lg">Sessions</h2>
          {sessions.length === 0 ? (
            <EmptyState icon={Video} title="Sessions coming soon" />
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {sessions.map(s => {
                const st = sessionStatus(s);
                const hasLink = s.completed ? !!s.recording_link : !!(s.zoom_link || s.zoom_join_url);
                return (
                <li
                  key={s.id}
                  onClick={() => openSession(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSession(s); } }}
                  className="flex items-start gap-3 py-3 -mx-2 px-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors duration-150 group"
                >
                  {/* Thumb → tap to enlarge (only when there's a real poster) */}
                  <button
                    type="button"
                    onClick={e => { if (s.poster_url) { e.stopPropagation(); setLightbox(s.poster_url); } }}
                    className="shrink-0"
                    aria-label={s.poster_url ? 'View image' : undefined}
                    tabIndex={s.poster_url ? 0 : -1}
                  >
                    <SessionThumb poster={s.poster_url} day={s.day_number} live={s.is_live_next} size="w-16 h-10" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-brand-600">{s.title}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {s.scheduled_at && new Date(s.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                          {' · '}{s.duration_minutes} min
                          {s.is_live_next && <span className="ml-2 font-bold text-red-600">NEXT LIVE</span>}
                        </p>
                      </div>
                      {/* Affordance only — whole row is clickable */}
                      <span className="shrink-0 text-slate-300 group-hover:text-brand-500">
                        {hasLink
                          ? (s.completed ? <PlayCircle className="w-5 h-5" /> : <Video className="w-5 h-5" />)
                          : <span className="text-[11px] text-slate-400">{s.completed ? (s.recording_status === 'processing' ? 'Soon' : '—') : 'Soon'}</span>}
                      </span>
                    </div>
                    {/* Per-student status */}
                    <div className="mt-1.5">
                      {st === 'attended' && <StatusPill icon={CheckCircle2} tone="bg-emerald-100 text-emerald-700">Attended{attMap[s.id]?.attendance_pct != null && ` · ${attMap[s.id].attendance_pct}%`}</StatusPill>}
                      {st === 'missed' && <StatusPill icon={XCircle} tone="bg-amber-100 text-amber-700">Missed</StatusPill>}
                      {st === 'upcoming' && <StatusPill icon={CalendarClock} tone="bg-sky-100 text-sky-700">Upcoming</StatusPill>}
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Leaderboard */}
        <Card className="p-5 md:p-6">
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
