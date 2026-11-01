import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Video, Radio, ChevronRight, CalendarClock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fmtDateTime } from '../lib/datetime';
import { fmtDays, classState, nextClass } from '../lib/liveClass';
import { Card, CategoryIcon } from './ui';
import ClassFeedback from './ClassFeedback';

const RATE_WINDOW_MS = 2 * 86400_000;

// Home card: the live classes this student is on the roster of — next class
// with a join button, plus a nudge to rate the last class. Renders nothing
// for students who aren't in any live class.
export default function MyLiveClasses({ profile, onJoin }) {
  const [classes, setClasses] = useState([]);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    const { data: enr } = await supabase.from('enrollments')
      .select('challenges!inner(id, name, recur_days, recur_category, recur_join_link, status, is_recurring)')
      .eq('user_id', profile.id).eq('status', 'active').eq('challenges.is_recurring', true);
    const list = (enr ?? []).map(e => e.challenges).filter(c => c.status !== 'completed');
    if (!list.length) return setClasses([]);

    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { data: ses } = await supabase.from('sessions')
      .select('id, challenge_id, title, scheduled_at, duration_minutes, zoom_link, is_cancelled')
      .in('challenge_id', list.map(c => c.id)).gte('scheduled_at', since).order('scheduled_at');
    const ended = (ses ?? []).filter(s => classState(s) === 'ended');
    const { data: fb } = ended.length
      ? await supabase.from('session_feedback').select('session_id').in('session_id', ended.map(s => s.id))
      : { data: [] };
    const rated = new Set((fb ?? []).map(f => f.session_id));

    setClasses(list.map(c => {
      const mine = (ses ?? []).filter(s => s.challenge_id === c.id);
      const last = ended.filter(s => s.challenge_id === c.id).pop();
      return { ...c, next: nextClass(mine), toRate: last && !rated.has(last.id) ? last : null };
    }));
  }, [profile.id]);
  useEffect(() => { load(); }, [load]);

  // Re-evaluate "join" state each minute so the button lights up on time.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!classes.length) return null;

  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-bold text-lg flex items-center gap-2"><Repeat className="w-5 h-5 text-brand-500" /> My Live Classes</h2>
      <ul className="mt-3 space-y-3">
        {classes.map(c => {
          const state = c.next ? classState(c.next, now) : null;
          const link = c.next?.zoom_link || c.recur_join_link;
          const joinable = (state === 'soon' || state === 'live') && link;
          return (
            <li key={c.id} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <CategoryIcon category={c.recur_category} className="w-5 h-5" />
                </span>
                <Link to={`/app/live/${c.id}`} className="flex-1 min-w-0 group">
                  <p className="font-bold text-sm truncate group-hover:text-brand-600">{c.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    {state === 'live'
                      ? <span className="inline-flex items-center gap-1 font-bold text-red-600"><Radio className="w-3.5 h-3.5" /> Live now</span>
                      : c.next
                        ? <><CalendarClock className="w-3.5 h-3.5" /> {fmtDateTime(c.next.scheduled_at)}</>
                        : fmtDays(c.recur_days)}
                  </p>
                </Link>
                {joinable ? (
                  <a href={link} target="_blank" rel="noreferrer" onClick={onJoin}
                    className={`btn-primary !py-2 !px-3.5 text-sm shrink-0 ${state === 'live' ? 'animate-pulse-glow' : ''}`}>
                    <Video className="w-4 h-4" /> Join
                  </a>
                ) : (
                  <Link to={`/app/live/${c.id}`} aria-label={`Open ${c.name}`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 shrink-0"><ChevronRight className="w-5 h-5" /></Link>
                )}
              </div>
              {c.toRate && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">How was the class on {fmtDateTime(c.toRate.scheduled_at)}?</p>
                  <ClassFeedback sessionId={c.toRate.id} onSaved={load} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
