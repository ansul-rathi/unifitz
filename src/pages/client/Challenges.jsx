import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, ProgressBar, EmptyState } from '../../components/ui';

function dayOf(challenge) {
  if (!challenge.start_date) return 0;
  const diff = Math.floor((Date.now() - new Date(challenge.start_date)) / 86400_000) + 1;
  return Math.min(Math.max(diff, 0), challenge.duration_days);
}

export default function ClientChallenges() {
  const { profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [enrolled, setEnrolled] = useState(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: ch }, { data: enr }] = await Promise.all([
        supabase.from('challenges').select('*').order('start_date'),
        supabase.from('enrollments').select('challenge_id').eq('user_id', profile.id),
      ]);
      setChallenges(ch ?? []);
      setEnrolled(new Set((enr ?? []).map(e => e.challenge_id)));
      setLoading(false);
    })();
  }, [profile.id]);

  async function join(id) {
    const { error } = await supabase.from('enrollments').insert({ user_id: profile.id, challenge_id: id });
    if (error) return toast(error.message, 'error');
    setEnrolled(s => new Set([...s, id]));
    toast("You're in! See your sessions on Home.");
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Challenges</h1>

      {challenges.length === 0 && (
        <Card><EmptyState icon={Trophy} title="No challenges yet" hint="New challenges will appear here." /></Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {challenges.map(c => {
          const day = dayOf(c);
          const isIn = enrolled.has(c.id);
          return (
            <Card key={c.id} className="p-6 flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  c.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                  : c.status === 'upcoming' ? 'bg-sky-100 text-sky-700'
                  : 'bg-slate-100 text-slate-600'
                }`}>
                  {c.status === 'active' ? `Active · Day ${day}` : c.status}
                </span>
                {c.is_free && <span className="text-xs font-bold bg-brand-100 text-brand-700 px-3 py-1 rounded-full">FREE</span>}
              </div>
              <h2 className="mt-3 text-xl font-bold">{c.name}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{c.description}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {c.batch_name && <>Batch: {c.batch_name} · </>}{c.duration_days} days
              </p>
              {c.status === 'active' && (
                <div className="mt-3">
                  <ProgressBar value={day} max={c.duration_days} />
                  <p className="mt-1 text-xs text-slate-500">{day} / {c.duration_days} days</p>
                </div>
              )}
              <div className="mt-5">
                {isIn ? (
                  <Link to={`/app/challenges/${c.id}`} className="btn-secondary w-full text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enrolled — View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button onClick={() => join(c.id)} className="btn-primary w-full text-sm">
                    Join Challenge <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
