import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Radio, CalendarClock, CheckCircle2, XCircle, MessageSquareQuote, CalendarX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fmtDateTime } from '../../lib/datetime';
import { fmtDays, classState, nextClass } from '../../lib/liveClass';
import { Card, Spinner, EmptyState, CategoryIcon, CountdownTimer } from '../../components/ui';
import ClassFeedback from '../../components/ClassFeedback';

const HISTORY_DAYS = 30;

// Student view of one live class: join the next class, and for each past
// class see attendance, the trainer's summary + personal remark, and rate it.
export default function LiveClass() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [c, setC] = useState(null);
  const [active, setActive] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState({}); // session_id → { attended, remark }
  const [feedback, setFeedback] = useState({});     // session_id → { rating, note }
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    const since = new Date(Date.now() - HISTORY_DAYS * 86400_000).toISOString();
    const [{ data: ch }, { data: enr }, { data: ses }] = await Promise.all([
      supabase.from('challenges').select('id, name, description, recur_days, recur_category, recur_join_link, status, is_recurring').eq('id', id).maybeSingle(),
      supabase.from('enrollments').select('status').eq('challenge_id', id).eq('user_id', profile.id).maybeSingle(),
      supabase.from('sessions').select('id, scheduled_at, duration_minutes, description, zoom_link, is_cancelled, day_number')
        .eq('challenge_id', id).gte('scheduled_at', since).order('scheduled_at'),
    ]);
    const sids = (ses ?? []).map(s => s.id);
    const [{ data: att }, { data: fb }] = sids.length
      ? await Promise.all([
          supabase.from('attendance').select('session_id, attended, remark').eq('user_id', profile.id).in('session_id', sids),
          supabase.from('session_feedback').select('session_id, rating, note').eq('user_id', profile.id).in('session_id', sids),
        ])
      : [{ data: [] }, { data: [] }];
    setC(ch);
    setActive(enr?.status === 'active');
    setSessions(ses ?? []);
    setAttendance(Object.fromEntries((att ?? []).map(a => [a.session_id, a])));
    setFeedback(Object.fromEntries((fb ?? []).map(f => [f.session_id, f])));
    setLoading(false);
  }, [id, profile.id]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <Spinner />;
  if (!c?.is_recurring) return <EmptyState title="Class not found" />;

  const next = active && c.status !== 'completed' ? nextClass(sessions, now) : null;
  const state = next ? classState(next, now) : null;
  const link = next?.zoom_link || c.recur_join_link;
  const past = sessions.filter(s => !s.is_cancelled && classState(s, now) === 'ended').reverse();
  const upcoming = sessions.filter(s => s !== next && new Date(s.scheduled_at) > now).slice(0, 5);

  return (
    <div className="space-y-5">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> Home</Link>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <CategoryIcon category={c.recur_category} className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-white">{c.name}</h1>
              <p className="text-sm text-slate-300">{fmtDays(c.recur_days)}</p>
            </div>
          </div>
          {c.description && <p className="mt-3 text-sm text-slate-300">{c.description}</p>}

          {!active ? (
            <p className="mt-5 text-sm text-slate-300">You're no longer on this class's roster. Your history is below.</p>
          ) : c.status === 'completed' ? (
            <p className="mt-5 text-sm text-slate-300">This class has ended.</p>
          ) : next ? (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                {state === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse-glow"><Radio className="w-3.5 h-3.5" /> Live now</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-slate-300"><CalendarClock className="w-3.5 h-3.5" /> Next class</span>
                )}
                <p className="mt-1 text-sm text-slate-200">{fmtDateTime(next.scheduled_at)} · {next.duration_minutes} min</p>
                {state === 'upcoming' && <p className="text-xl text-brand-400 mt-1"><CountdownTimer target={next.scheduled_at} onZero={() => setNow(Date.now())} /></p>}
              </div>
              {link && (state === 'soon' || state === 'live') ? (
                <a href={link} target="_blank" rel="noreferrer" className={`btn-primary sm:ml-auto ${state === 'live' ? 'animate-pulse-glow' : ''}`}>
                  <Video className="w-5 h-5" /> Join class
                </a>
              ) : (
                <span className="sm:ml-auto inline-flex items-center gap-2 bg-white/10 text-slate-300 font-bold px-5 py-3 rounded-xl text-sm">
                  <Video className="w-5 h-5" /> {link ? 'Opens 15 min before' : 'Link coming soon'}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-300">No upcoming classes scheduled.</p>
          )}
        </div>

        {active && upcoming.length > 0 && (
          <ul className="px-5 md:px-6 py-3 flex flex-wrap gap-2">
            {upcoming.map(s => (
              <li key={s.id} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.is_cancelled ? 'bg-red-50 text-red-600 line-through' : 'bg-slate-100 text-slate-600'}`}>
                {fmtDateTime(s.scheduled_at)}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5 md:p-6">
        <h2 className="font-bold text-lg">Past classes</h2>
        {past.length === 0 ? (
          <EmptyState icon={CalendarX} title="No classes yet" hint="After each class you'll see your attendance and your trainer's notes here." />
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {past.map(s => {
              const a = attendance[s.id];
              return (
                <li key={s.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{fmtDateTime(s.scheduled_at)}</p>
                    {a ? (
                      a.attended
                        ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Present</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400"><XCircle className="w-4 h-4" /> Missed</span>
                    ) : <span className="text-xs font-semibold text-slate-400">Attendance pending</span>}
                  </div>
                  {s.description && <p className="text-sm text-slate-600">{s.description}</p>}
                  {a?.remark && (
                    <p className="flex items-start gap-2 rounded-xl bg-brand-50 border border-brand-100 px-3 py-2 text-sm text-brand-900">
                      <MessageSquareQuote className="w-4 h-4 shrink-0 mt-0.5 text-brand-500" /> {a.remark}
                    </p>
                  )}
                  {active && <ClassFeedback sessionId={s.id} initial={feedback[s.id]} onSaved={f => setFeedback(x => ({ ...x, [s.id]: f }))} />}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
