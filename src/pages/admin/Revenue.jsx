import { useEffect, useState } from 'react';
import { IndianRupee, Wallet, Check, X, Loader2, CreditCard, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Card, Spinner, StatCard, Avatar, EmptyState } from '../../components/ui';

export default function AdminRevenue() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [earnings, setEarnings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [names, setNames] = useState({});
  const [teacherSplit, setTeacherSplit] = useState([]);

  async function load() {
    const [{ data: e }, { data: pays }, { data: profiles }, { data: cts }] = await Promise.all([
      supabase.from('series_earnings').select('*'),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, avatar_url, role'),
      supabase.from('challenge_teachers').select('challenge_id, teacher_id'),
    ]);
    setEarnings(e ?? []);
    setPayments(pays ?? []);
    const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
    setNames(nameMap);

    // Per-teacher payout = sum over their series of (teacher_pool / teacher_count).
    const split = {};
    for (const row of e ?? []) {
      const teachers = (cts ?? []).filter(c => c.challenge_id === row.challenge_id);
      const per = row.teacher_count > 0 ? row.teacher_pool / row.teacher_count : 0;
      for (const t of teachers) split[t.teacher_id] = (split[t.teacher_id] ?? 0) + per;
    }
    setTeacherSplit(Object.entries(split).map(([id, amount]) => ({ id, amount })).sort((a, b) => b.amount - a.amount));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function verify(p, status) {
    const { error } = await supabase.from('payments').update({ status, verified_by: (await supabase.auth.getUser()).data.user?.id }).eq('id', p.id);
    if (error) return toast(error.message, 'error');
    toast(status === 'verified' ? 'Cash verified — student enrolled' : 'Payment rejected');
    load();
  }

  if (loading) return <Spinner />;

  const gross = earnings.reduce((s, e) => s + Number(e.gross), 0);
  const unifitz = earnings.reduce((s, e) => s + Number(e.unifitz_cut), 0);
  const teacherPool = earnings.reduce((s, e) => s + Number(e.teacher_pool), 0);
  const pendingCash = payments.filter(p => p.status === 'pending_verification');
  const chartData = earnings.filter(e => Number(e.gross) > 0).map(e => ({ name: e.name?.slice(0, 12), gross: Number(e.gross) }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Revenue</h1>

      <div className="inline-flex bg-slate-100 rounded-xl p-1 flex-wrap">
        {[['overview', 'Overview'], ['cash', `Cash to verify${pendingCash.length ? ` · ${pendingCash.length}` : ''}`], ['payouts', 'Teacher payouts']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${tab === k ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard icon={IndianRupee} label="Gross collected" value={`₹${gross.toLocaleString('en-IN')}`} sub="verified + online" />
            <StatCard icon={IndianRupee} label="UniFitz (20%)" value={`₹${unifitz.toLocaleString('en-IN')}`} accent="text-brand-500" />
            <StatCard icon={Users} label="Teacher pool (80%)" value={`₹${teacherPool.toLocaleString('en-IN')}`} accent="text-emerald-500" />
          </div>
          <Card className="p-5">
            <h3 className="font-bold mb-3">Revenue by series</h3>
            {chartData.length === 0 ? <EmptyState icon={IndianRupee} title="No paid enrollments yet" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} width={56} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="gross" fill="#F97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </>
      )}

      {tab === 'cash' && (
        <div className="space-y-3">
          {pendingCash.length === 0 ? <Card className="p-6 text-center text-sm text-slate-500">No cash payments awaiting verification.</Card> : pendingCash.map(p => (
            <Card key={p.id} className="p-4 flex flex-wrap items-center gap-3">
              <Wallet className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-[180px]">
                <p className="font-bold text-sm">{names[p.user_id]?.full_name ?? 'Member'} · ₹{p.amount}</p>
                <p className="text-xs text-slate-500">
                  Paid to {names[p.cash_collector_id]?.full_name ?? '—'} · {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => verify(p, 'verified')} className="btn-primary !py-2 !px-3 text-xs"><Check className="w-4 h-4" /> Verify & enroll</button>
                <button onClick={() => verify(p, 'rejected')} className="btn-secondary !py-2 !px-3 text-xs text-red-600"><X className="w-4 h-4" /> Reject</button>
              </div>
            </Card>
          ))}

          {/* All payments log */}
          <Card className="p-5">
            <h3 className="font-bold mb-3">All payments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
                  <tr><th className="py-2 pr-4 font-bold">Member</th><th className="py-2 pr-4 font-bold">Amount</th><th className="py-2 pr-4 font-bold">Method</th><th className="py-2 font-bold">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-4 font-semibold">{names[p.user_id]?.full_name ?? '—'}</td>
                      <td className="py-2.5 pr-4">₹{p.amount}</td>
                      <td className="py-2.5 pr-4">{p.method === 'cash' ? <Wallet className="w-4 h-4 inline text-emerald-500" /> : <CreditCard className="w-4 h-4 inline text-brand-500" />} {p.method}</td>
                      <td className="py-2.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          ['paid', 'verified'].includes(p.status) ? 'bg-emerald-100 text-emerald-700'
                          : p.status === 'pending_verification' ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan="4" className="py-4 text-center text-slate-400">No payments yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === 'payouts' && (
        <Card className="p-5">
          <h3 className="font-bold mb-1">Teacher payouts <span className="text-sm font-normal text-slate-400">(80% pool, split per series)</span></h3>
          {teacherSplit.length === 0 ? <EmptyState icon={Users} title="No payouts yet" /> : (
            <ol className="mt-3 space-y-2.5">
              {teacherSplit.map((t, i) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-slate-400">{i + 1}</span>
                  <Avatar name={names[t.id]?.full_name} url={names[t.id]?.avatar_url} size="w-8 h-8" />
                  <span className="flex-1 text-sm font-semibold">{names[t.id]?.full_name ?? 'Teacher'}</span>
                  <span className="text-sm font-bold text-emerald-600">₹{Math.round(t.amount).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}
    </div>
  );
}
