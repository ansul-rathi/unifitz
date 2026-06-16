import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Video, PlayCircle, Medal, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Spinner, Avatar, EmptyState, SessionThumb } from '../../components/ui';

const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

export default function ChallengeDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [board, setBoard] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).single();
      setChallenge(ch ?? null);
      if (ch?.teacher_id) {
        // Teacher profile may not be readable under RLS — fall back gracefully.
        const { data: t } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', ch.teacher_id).maybeSingle();
        setTeacher(t ?? null);
      }
      const [{ data: ses }, { data: lb }] = await Promise.all([
        supabase.from('sessions').select('*').eq('challenge_id', id).order('day_number'),
        supabase.from('leaderboard').select('*').eq('challenge_id', id).order('attendance_count', { ascending: false }),
      ]);
      setSessions(ses ?? []);
      setBoard(lb ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Spinner />;
  if (!challenge) return <EmptyState title="Challenge not found" />;

  return (
    <div className="space-y-5">
      <Link to="/app/challenges" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors duration-200">
        <ArrowLeft className="w-4 h-4" /> All challenges
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{challenge.name}</h1>
        <p className="mt-2 text-sm text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
          {teacher && <span className="inline-flex items-center gap-1.5"><Avatar name={teacher.full_name} url={teacher.avatar_url} size="w-6 h-6" /> {teacher.full_name}</span>}
          {challenge.batch_name && <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> {challenge.batch_name} · {board.length} members</span>}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sessions */}
        <Card className="p-5 md:p-6 lg:col-span-2">
          <h2 className="font-bold text-lg">Sessions</h2>
          {sessions.length === 0 ? (
            <EmptyState icon={Video} title="Sessions coming soon" />
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {sessions.map(s => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <SessionThumb poster={s.poster_url} day={s.day_number} live={s.is_live_next} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.title}</p>
                    <p className="text-xs text-slate-500">
                      {s.scheduled_at && new Date(s.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                      {' · '}{s.duration_minutes} min
                      {s.is_live_next && <span className="ml-2 font-bold text-red-600">NEXT LIVE</span>}
                    </p>
                  </div>
                  <a
                    href={(s.completed ? s.recording_link : s.zoom_link) || '#'}
                    target="_blank" rel="noreferrer"
                    className="btn-secondary !py-2 !px-3.5 text-xs shrink-0"
                  >
                    {s.completed ? <><PlayCircle className="w-4 h-4" /> Recording</> : <><Video className="w-4 h-4" /> Zoom</>}
                  </a>
                </li>
              ))}
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
    </div>
  );
}
