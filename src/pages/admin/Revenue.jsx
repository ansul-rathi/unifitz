import { useEffect, useState } from 'react';
import { IndianRupee, Lock, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';
import { Card, Spinner, StatCard } from '../../components/ui';

// Mock projection for the paid phase — illustrative only.
const MOCK_MONTHS = [
  { month: 'Jul', earnings: 0 }, { month: 'Aug', earnings: 12000 }, { month: 'Sep', earnings: 28000 },
  { month: 'Oct', earnings: 45000 }, { month: 'Nov', earnings: 61000 }, { month: 'Dec', earnings: 84000 },
];

export default function AdminRevenue() {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [prices, setPrices] = useState(() => JSON.parse(localStorage.getItem('uf_prices') || '{}'));

  useEffect(() => {
    supabase.from('challenges').select('id, name, is_free').then(({ data }) => {
      setChallenges(data ?? []);
      setLoading(false);
    });
  }, []);

  function setPrice(id, v) {
    const next = { ...prices, [id]: v };
    setPrices(next);
    localStorage.setItem('uf_prices', JSON.stringify(next));
  }

  if (loading) return <Spinner />;

  const members = 500; // illustrative
  const projected = challenges.reduce((sum, c) => sum + (Number(prices[c.id]) || 0), 0) * Math.round(members * 0.2);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold">Revenue</h1>

      <Card className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 !border-0 text-white flex flex-wrap items-center gap-4">
        <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-white/10">
          <Lock className="w-6 h-6 text-brand-400" />
        </span>
        <div className="flex-1 min-w-[220px]">
          <h3 className="font-bold text-white">Paid phase — coming soon</h3>
          <p className="text-sm text-slate-300 mt-0.5">Set pricing now; flip the switch when you're ready to monetize.</p>
        </div>
        <button disabled className="inline-flex items-center gap-2 bg-white/10 text-white/60 font-bold px-5 py-3 rounded-xl text-sm cursor-not-allowed">
          <Sparkles className="w-4 h-4" /> Enable payments (coming soon)
        </button>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <StatCard icon={IndianRupee} label="Projected monthly" value={`₹${projected.toLocaleString('en-IN')}`} sub="at 20% conversion (mock)" />
        <StatCard icon={IndianRupee} label="Collected so far" value="₹0" sub="free phase" accent="text-emerald-500" />
      </div>

      <Card className="p-5">
        <h3 className="font-bold mb-3">Pricing per challenge (₹/member)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {challenges.map(c => (
            <label key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <span className="flex-1 text-sm font-semibold">{c.name}</span>
              <span className="text-slate-400 text-sm">₹</span>
              <input
                type="number" min="0" placeholder="999"
                value={prices[c.id] ?? ''}
                onChange={e => setPrice(c.id, e.target.value)}
                className="w-24 text-right font-bold outline-none"
              />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold mb-3">Earnings projection (mock)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={MOCK_MONTHS}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} width={56} tickFormatter={v => `₹${v / 1000}k`} />
            <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
            <Bar dataKey="earnings" fill="#F97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
