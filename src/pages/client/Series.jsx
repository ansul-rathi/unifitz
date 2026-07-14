import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PaymentSheet from '../../components/PaymentSheet';
import { Card, Spinner, ProgressBar, EmptyState } from '../../components/ui';


export default function ClientSeries() {
  const { profile, session } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [enrolled, setEnrolled] = useState(new Set());
  const [pending, setPending] = useState(new Set());      // challenge ids awaiting cash verification
  const [sessionCounts, setSessionCounts] = useState({}); // challenge_id → { total, done }
  const [payFor, setPayFor] = useState(null);             // series being paid for

  async function load() {
    const [{ data: ch }, { data: enr }, { data: pays }, { data: ses }, { data: att }] = await Promise.all([
      supabase.from('challenges').select('*').order('start_date'),
      supabase.from('enrollments').select('challenge_id').eq('user_id', profile.id),
      supabase.from('payments').select('challenge_id, status').eq('user_id', profile.id).eq('status', 'pending_verification'),
      supabase.from('sessions').select('id, challenge_id, completed'),
      supabase.from('attendance').select('session_id, attended').eq('user_id', profile.id),
    ]);
    setChallenges(ch ?? []);
    setEnrolled(new Set((enr ?? []).map(e => e.challenge_id)));
    setPending(new Set((pays ?? []).map(p => p.challenge_id)));
    // Per-series counts. total = all sessions, held = already completed (happened),
    // attended = THIS student's attended sessions (from attendance, ≥75%).
    const counts = {};
    const sToCh = {};
    for (const s of ses ?? []) {
      sToCh[s.id] = s.challenge_id;
      (counts[s.challenge_id] ??= { total: 0, held: 0, attended: 0 });
      counts[s.challenge_id].total++;
      if (s.completed) counts[s.challenge_id].held++;
    }
    for (const a of att ?? []) {
      const cid = sToCh[a.session_id];
      if (a.attended && cid && counts[cid]) counts[cid].attended++;
    }
    setSessionCounts(counts);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [profile.id]);

  async function joinFree(id) {
    const { error } = await supabase.from('enrollments').insert({ user_id: profile.id, challenge_id: id });
    if (error) return toast(error.message, 'error');
    setEnrolled(s => new Set([...s, id]));
    toast("You're in! See your sessions on Home.");
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Series</h1>

      {challenges.length === 0 && (
        <Card><EmptyState icon={Trophy} title="No series yet" hint="New series will appear here." /></Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {challenges.map(c => {
          const sc = sessionCounts[c.id] ?? { total: 0, held: 0, attended: 0 };
          const isIn = enrolled.has(c.id);
          const isPending = pending.has(c.id);
          const remaining = Math.max(0, sc.total - sc.attended); // sessions left for this student
          const missed = Math.max(0, sc.held - sc.attended);     // happened but not attended
          return (
            <Card key={c.id} className="overflow-hidden flex flex-col">
              {c.poster_url && <img src={c.poster_url} alt={c.name} className="w-full aspect-[16/7] object-cover" />}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    c.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                    : c.status === 'upcoming' ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status === 'active'
                      ? (sc.total ? `Active · ${isIn ? sc.attended : sc.held}/${sc.total}` : 'Active')
                      : c.status}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.is_free ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>
                    {c.is_free ? 'FREE' : `₹${c.price}`}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-bold">{c.name}</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{c.description}</p>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {c.batch_name && <>Batch: {c.batch_name} · </>}{c.duration_days} days
                </p>
                {sc.total > 0 && (
                  <div className="mt-3">
                    {isIn ? (
                      <>
                        <ProgressBar value={sc.attended} max={sc.total} />
                        <p className="mt-1 text-xs text-slate-500">
                          You've attended <span className="font-bold text-slate-700">{sc.attended}</span> of {sc.total} sessions
                          {remaining > 0 && <> · {remaining} remaining</>}
                        </p>
                        {missed > 0 && <p className="text-[11px] font-semibold text-amber-600">{missed} missed so far</p>}
                      </>
                    ) : (
                      <>
                        <ProgressBar value={sc.held} max={sc.total} />
                        <p className="mt-1 text-xs text-slate-500">{sc.held} / {sc.total} sessions done</p>
                      </>
                    )}
                  </div>
                )}
                <div className="mt-5">
                  {isIn ? (
                    <Link to={`/app/series/${c.id}`} className="btn-secondary w-full text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enrolled — View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : isPending ? (
                    <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                      <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
                        <Clock className="w-4 h-4" /> Cash payment under verification
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700">Usually confirmed within a few hours. You'll be enrolled automatically once verified.</p>
                    </div>
                  ) : c.is_free ? (
                    <button onClick={() => joinFree(c.id)} className="btn-primary w-full text-sm">
                      Join Series <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button onClick={() => openPay(c)} className="btn-primary w-full text-sm">
                        Enroll · ₹{c.price} <ArrowRight className="w-4 h-4" />
                      </button>
                      {c.free_session_count > 0 && (
                        <Link to={`/app/series/${c.id}`} className="btn-secondary w-full text-sm">
                          Watch {c.free_session_count} free session{c.free_session_count === 1 ? '' : 's'}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {payFor && (
        <PaymentSheet
          series={payFor}
          profile={profile}
          email={session?.user?.email}
          onClose={() => setPayFor(null)}
          onEnrolled={() => { setPayFor(null); load(); }}
        />
      )}
    </div>
  );
}
