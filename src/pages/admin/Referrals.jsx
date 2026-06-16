import { useEffect, useState } from 'react';
import { Gift, CheckCircle2, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, EmptyState, Avatar } from '../../components/ui';

const STATUS_STYLE = {
  signed_up: 'bg-slate-100 text-slate-600',
  active: 'bg-sky-100 text-sky-700',
  reward_earned: 'bg-emerald-100 text-emerald-700',
};

export default function AdminReferrals() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [names, setNames] = useState({});
  const [rules, setRules] = useState(() => localStorage.getItem('uf_reward_rules')
    ?? 'Friend completes Day 7 of any challenge → both earn points. 3 successful referrals → Super Referrer badge + free 1-on-1 consult.');

  async function load() {
    const [{ data: refs }, { data: profiles }] = await Promise.all([
      supabase.from('referrals').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, avatar_url'),
    ]);
    setRows(refs ?? []);
    setNames(Object.fromEntries((profiles ?? []).map(p => [p.id, p])));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function approve(id) {
    const { error } = await supabase.from('referrals').update({ reward_approved: true }).eq('id', id);
    if (error) return toast(error.message, 'error');
    toast('Reward approved');
    load();
  }

  // Leaderboard: rewards earned per referrer.
  const board = Object.values(
    rows.filter(r => r.status === 'reward_earned').reduce((acc, r) => {
      acc[r.referrer_id] ??= { id: r.referrer_id, count: 0 };
      acc[r.referrer_id].count++;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count).slice(0, 5);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Referrals</h1>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-bold text-lg">All referrals</h3>
          {rows.length === 0 ? (
            <EmptyState icon={Gift} title="No referrals yet" />
          ) : (
            <ul className="mt-3 space-y-2.5">
              {rows.map(r => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3">
                  <Avatar name={names[r.referrer_id]?.full_name} url={names[r.referrer_id]?.avatar_url} size="w-8 h-8" />
                  <div className="flex-1 min-w-[150px]">
                    <p className="text-sm font-semibold">
                      {names[r.referrer_id]?.full_name ?? 'Member'} → {names[r.referred_id]?.full_name ?? 'Friend'}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLE[r.status]}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                  {r.status === 'reward_earned' && (
                    r.reward_approved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Approved
                      </span>
                    ) : (
                      <button onClick={() => approve(r.id)} className="btn-primary !py-1.5 !px-3.5 text-xs">
                        Approve reward
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Referral leaderboard</h3>
            {board.length === 0 ? (
              <p className="text-sm text-slate-400 mt-3">No rewards earned yet.</p>
            ) : (
              <ol className="mt-3 space-y-2.5">
                {board.map((b, i) => (
                  <li key={b.id} className="flex items-center gap-3">
                    <span className="w-5 text-sm font-bold text-slate-400">{i + 1}</span>
                    <Avatar name={names[b.id]?.full_name} url={names[b.id]?.avatar_url} size="w-8 h-8" />
                    <span className="flex-1 text-sm font-semibold truncate">{names[b.id]?.full_name}</span>
                    <span className="text-sm font-bold text-brand-600">{b.count}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-lg">Reward rules</h3>
            <textarea
              rows="5"
              className="input mt-3 text-sm"
              value={rules}
              onChange={e => setRules(e.target.value)}
            />
            <button
              onClick={() => { localStorage.setItem('uf_reward_rules', rules); toast('Rules saved'); }}
              className="btn-secondary w-full mt-3 text-sm"
            >
              Save rules
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
