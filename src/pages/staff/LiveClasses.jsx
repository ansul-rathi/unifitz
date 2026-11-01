import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Repeat, Plus, Users, CalendarClock, ClipboardCheck, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fmtDateTime } from '../../lib/datetime';
import { fmtSchedule, nextClass } from '../../lib/liveClass';
import { Card, Spinner, EmptyState, CategoryIcon } from '../../components/ui';
import LiveClassForm from '../../components/LiveClassForm';

const WEEK_MS = 7 * 86400_000;

// Live classes (recurring series) — teachers see the classes they run, admins
// see every class and can create one for any teacher.
export default function LiveClasses() {
  const { profile } = useAuth();
  const isAdmin = profile.role === 'admin';
  const base = isAdmin ? '/admin/live' : '/teacher/live';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({}); // challenge_id → { members, next, pending }
  const [teachers, setTeachers] = useState([]);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    // RLS already scopes a teacher to the classes they teach.
    const [{ data: ch }, { data: t }] = await Promise.all([
      supabase.from('challenges').select('*').eq('is_recurring', true).order('created_at', { ascending: false }),
      isAdmin ? supabase.from('profiles').select('id, full_name').eq('role', 'teacher').order('full_name') : Promise.resolve({ data: [] }),
    ]);
    const list = ch ?? [];
    setRows(list);
    setTeachers(t ?? []);

    const ids = list.map(c => c.id);
    if (ids.length) {
      const since = new Date(Date.now() - WEEK_MS).toISOString();
      const [{ data: enr }, { data: ses }] = await Promise.all([
        supabase.from('enrollments').select('challenge_id').in('challenge_id', ids).eq('status', 'active'),
        supabase.from('sessions').select('id, challenge_id, scheduled_at, duration_minutes, is_cancelled')
          .in('challenge_id', ids).gte('scheduled_at', since).order('scheduled_at'),
      ]);
      const now = Date.now();
      const ended = (ses ?? []).filter(s => !s.is_cancelled && new Date(s.scheduled_at).getTime() + s.duration_minutes * 60_000 < now);
      const { data: att } = ended.length
        ? await supabase.from('attendance').select('session_id').in('session_id', ended.map(s => s.id))
        : { data: [] };
      const marked = new Set((att ?? []).map(a => a.session_id));

      const agg = {};
      for (const c of list) {
        const mine = (ses ?? []).filter(s => s.challenge_id === c.id);
        agg[c.id] = {
          members: (enr ?? []).filter(e => e.challenge_id === c.id).length,
          next: nextClass(mine),
          pending: ended.filter(s => s.challenge_id === c.id && !marked.has(s.id)).length,
        };
      }
      setStats(agg);
    }
    setLoading(false);
  }, [isAdmin]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;

  const teacherName = id => teachers.find(t => t.id === id)?.full_name;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Live Classes</h1>
          <p className="text-sm text-slate-500 mt-1">Recurring classes with a fixed group of students.</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary !py-2.5 text-sm"><Plus className="w-4 h-4" /> New class</button>
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon={Repeat} title="No live classes yet" hint="Create a class that repeats on set days — e.g. Mon–Fri at 7 AM — then pick its students." /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(c => {
            const st = stats[c.id] ?? { members: 0, next: null, pending: 0 };
            const ended = c.status === 'completed';
            return (
              <Link key={c.id} to={`${base}/${c.id}`}>
                <Card className={`p-5 h-full flex flex-col hover:shadow-md transition-shadow duration-200 ${ended ? 'opacity-70' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <CategoryIcon category={c.recur_category} className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold truncate">{c.name}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{fmtSchedule(c)}{isAdmin && teacherName(c.teacher_id) && <> · {teacherName(c.teacher_id)}</>}</p>
                    </div>
                    {ended
                      ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">Ended</span>
                      : st.members === 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">Add students</span>}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-500" /> {st.members} student{st.members === 1 ? '' : 's'}</span>
                    {!ended && st.next && <span className="inline-flex items-center gap-1.5"><CalendarClock className="w-4 h-4 text-sky-500" /> {fmtDateTime(st.next.scheduled_at)}</span>}
                    {st.pending > 0 && <span className="inline-flex items-center gap-1.5 font-semibold text-red-600"><ClipboardCheck className="w-4 h-4" /> {st.pending} to mark</span>}
                  </div>
                  <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">Manage <ArrowRight className="w-4 h-4" /></span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {creating && (
        <LiveClassForm isAdmin={isAdmin} teachers={teachers} onClose={() => setCreating(false)}
          onSaved={id => navigate(`${base}/${id}?roster=1`)} />
      )}
    </div>
  );
}
