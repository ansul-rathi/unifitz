import { FC, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';

type Status = 'pending' | 'verified' | 'rejected';

interface Registration {
  id: string;
  created_at: string;
  full_name: string;
  whatsapp_number: string;
  age: number;
  city: string;
  batch_timing: string;
  primary_goal: string;
  fitness_experience: string;
  payment_screenshot_url: string | null;
  status: Status;
  notes: string | null;
}

const STATUS_STYLES: Record<Status, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  verified: 'bg-green-500/15 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const StrengthChallengeResults: FC = () => {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('strength_challenge_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setRows(data as Registration[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: Status) => {
    setUpdating(id);
    await supabase.from('strength_challenge_registrations').update({ status }).eq('id', id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  };

  const getScreenshotUrl = async (path: string) => {
    const { data } = await supabase.storage.from('payment-screenshots').createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const filtered = rows
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) =>
      !search ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      r.whatsapp_number.includes(search)
    );

  const counts = {
    total: rows.length,
    pending: rows.filter((r) => r.status === 'pending').length,
    verified: rows.filter((r) => r.status === 'verified').length,
    rejected: rows.filter((r) => r.status === 'rejected').length,
  };

  return (
    <>
      <Helmet>
        <title>30-Day Challenge Results | Unifitz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1] font-lexend">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#131313]/95 backdrop-blur-2xl border-b border-[#d4af37]/20 px-4 sm:px-8 py-4">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-[#f2ca50] font-black text-lg uppercase tracking-tight">UNIFITZ Admin</div>
              <div className="text-[#d0c5af] text-xs mt-0.5">30-Day Strength Challenge — Registrations</div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#f2ca50] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#d4af37]/20 transition-all"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Refresh
            </button>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: 'Total', value: counts.total, color: 'text-[#f2ca50]', bg: 'bg-[#d4af37]/10', border: 'border-[#d4af37]/20' },
              { label: 'Pending', value: counts.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
              { label: 'Verified', value: counts.verified, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
              { label: 'Rejected', value: counts.rejected, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 sm:p-5`}>
                <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#d0c5af] mt-1 font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-6">
            <input
              type="text"
              placeholder="Search by name, city, or number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-[#201f1f] border border-[#99907c]/30 rounded-lg px-4 h-10 text-[#e5e2e1] placeholder:text-[#99907c] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none text-sm transition-all"
            />
            <div className="flex gap-2">
              {(['all', 'pending', 'verified', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                    filter === f
                      ? 'bg-[#d4af37] text-[#3c2f00]'
                      : 'bg-white/5 border border-[#d4af37]/20 text-[#d0c5af] hover:border-[#d4af37]/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
              Error: {error}
            </div>
          )}

          {/* Table (desktop) / Cards (mobile) */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-[#d0c5af]">
              <span className="material-symbols-outlined animate-spin text-2xl text-[#f2ca50]">progress_activity</span>
              Loading registrations…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-[#d0c5af]">No registrations found.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-[#d4af37]/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#201f1f] border-b border-[#d4af37]/10">
                      {['#', 'Name', 'WhatsApp', 'Age', 'City', 'Batch', 'Goal', 'Experience', 'Screenshot', 'Status', 'Actions', 'Registered'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-[#d0c5af] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4af37]/5">
                    {filtered.map((r, i) => (
                      <tr key={r.id} className="bg-[#131313] hover:bg-[#201f1f]/60 transition-colors">
                        <td className="px-4 py-3 text-[#d0c5af] text-xs">{i + 1}</td>
                        <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{r.full_name}</td>
                        <td className="px-4 py-3">
                          <a href={`https://wa.me/91${r.whatsapp_number}`} target="_blank" rel="noreferrer" className="text-[#f2ca50] hover:underline font-mono text-xs">{r.whatsapp_number}</a>
                        </td>
                        <td className="px-4 py-3 text-[#d0c5af]">{r.age}</td>
                        <td className="px-4 py-3 text-[#d0c5af] whitespace-nowrap">{r.city}</td>
                        <td className="px-4 py-3 text-[#d0c5af] whitespace-nowrap text-xs">{r.batch_timing}</td>
                        <td className="px-4 py-3">
                          <span className="bg-[#d4af37]/10 text-[#f2ca50] px-2 py-0.5 rounded text-[10px] font-bold">{r.primary_goal}</span>
                        </td>
                        <td className="px-4 py-3 text-[#d0c5af] text-xs">{r.fitness_experience}</td>
                        <td className="px-4 py-3">
                          {r.payment_screenshot_url ? (
                            <button
                              onClick={() => r.payment_screenshot_url && getScreenshotUrl(r.payment_screenshot_url)}
                              className="text-[#f2ca50] hover:text-[#d4af37] text-xs underline flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">image</span> View
                            </button>
                          ) : <span className="text-[#99907c] text-xs">None</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${STATUS_STYLES[r.status]}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {(['verified', 'rejected', 'pending'] as Status[]).filter((s) => s !== r.status).map((s) => (
                              <button
                                key={s}
                                disabled={updating === r.id}
                                onClick={() => updateStatus(r.id, s)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all disabled:opacity-40 ${
                                  s === 'verified' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                  s === 'rejected' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                  'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#d0c5af] text-xs whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filtered.map((r) => (
                  <div key={r.id} className="bg-[#201f1f] border border-[#d4af37]/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-white font-bold">{r.full_name}</div>
                        <a href={`https://wa.me/91${r.whatsapp_number}`} target="_blank" rel="noreferrer" className="text-[#f2ca50] text-xs font-mono">+91 {r.whatsapp_number}</a>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-[#d0c5af] mb-3">
                      <span>Age: <b className="text-white">{r.age}</b></span>
                      <span>City: <b className="text-white">{r.city}</b></span>
                      <span>Batch: <b className="text-white">{r.batch_timing}</b></span>
                      <span>Goal: <b className="text-[#f2ca50]">{r.primary_goal}</b></span>
                      <span>Level: <b className="text-white">{r.fitness_experience}</b></span>
                      <span>Date: <b className="text-white">{new Date(r.created_at).toLocaleDateString('en-IN')}</b></span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.payment_screenshot_url && (
                        <button
                          onClick={() => r.payment_screenshot_url && getScreenshotUrl(r.payment_screenshot_url)}
                          className="flex items-center gap-1 text-[#f2ca50] bg-[#d4af37]/10 px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">image</span> Screenshot
                        </button>
                      )}
                      {(['verified', 'rejected', 'pending'] as Status[]).filter((s) => s !== r.status).map((s) => (
                        <button
                          key={s}
                          disabled={updating === r.id}
                          onClick={() => updateStatus(r.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 ${
                            s === 'verified' ? 'bg-green-500/20 text-green-400' :
                            s === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          Mark {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-[#99907c] text-xs mt-6">
                Showing {filtered.length} of {rows.length} registrations
              </p>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default StrengthChallengeResults;
