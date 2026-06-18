import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Video, CheckCircle2, ArrowRight, CalendarDays } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, Spinner, EmptyState } from '../../components/ui';

export default function TeacherSeries() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({}); // challenge_id → { sessions, completed }

  useEffect(() => {
    (async () => {
      // Series this teacher runs — lead teacher_id OR co-teacher.
      const [{ data: own }, { data: ct }] = await Promise.all([
        supabase.from('challenges').select('*').eq('teacher_id', profile.id),
        supabase.from('challenge_teachers').select('challenges(*)').eq('teacher_id', profile.id),
      ]);
      const map = new Map();
      for (const c of own ?? []) map.set(c.id, c);
      for (const r of ct ?? []) if (r.challenges) map.set(r.challenges.id, r.challenges);
      const list = [...map.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setRows(list);

      const ids = list.map(c => c.id);
      if (ids.length) {
        const { data: ses } = await supabase.from('sessions').select('challenge_id, completed').in('challenge_id', ids);
        const agg = {};
        for (const c of list) agg[c.id] = { sessions: 0, completed: 0 };
        for (const s of ses ?? []) if (agg[s.challenge_id]) { agg[s.challenge_id].sessions++; if (s.completed) agg[s.challenge_id].completed++; }
        setStats(agg);
      }
      setLoading(false);
    })();
  }, [profile.id]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">My Series</h1>
      <p className="text-sm text-slate-500">Series you run — open one to add or edit its sessions.</p>

      {rows.length === 0 ? (
        <Card><EmptyState icon={Layers} title="No series yet" hint="An admin assigns you to a series — it'll appear here." /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(c => {
            const st = stats[c.id] ?? { sessions: 0, completed: 0 };
            return (
              <Link key={c.id} to={`/teacher/series/${c.id}`}>
                <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
                  {c.poster_url
                    ? <img src={c.poster_url} alt={c.name} className="w-full aspect-[16/7] object-cover" />
                    : <div className="w-full aspect-[16/7] bg-gradient-to-br from-brand-400 to-orange-600 flex items-center justify-center"><Layers className="w-8 h-8 text-white/80" /></div>}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{c.name}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'upcoming' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                      {!c.is_published && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">Hidden</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {c.batch_name || 'No batch'} · {c.duration_days} days</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5"><Video className="w-4 h-4 text-violet-500" /> {st.sessions} sessions</span>
                      <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {st.completed} done</span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">Manage <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
