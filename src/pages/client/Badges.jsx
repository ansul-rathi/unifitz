import { useEffect, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { Award, Lock, Zap, Trophy, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { TIERS, TIER_ORDER } from '../../lib/badges';
import { Card, Spinner, Confetti } from '../../components/ui';

function Glyph({ name, className }) {
  const Cmp = Icons[name] ?? Award;
  return <Cmp className={className} />;
}

// Premium medallion: gradient metal disc + top gloss + tier glow when earned;
// flat greyed disc with a lock when not.
function Medallion({ icon, tier, earned, size = 'w-16 h-16' }) {
  const t = TIERS[tier] ?? TIERS.bronze;
  if (!earned) {
    return (
      <span className={`relative ${size} rounded-full bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center grayscale`}>
        <Lock className="w-5 h-5 text-slate-400" />
      </span>
    );
  }
  return (
    <span className={`relative ${size} rounded-full bg-gradient-to-br ${t.grad} ${t.glow} ring-1 ring-white/40 flex items-center justify-center overflow-hidden`}>
      {/* top gloss */}
      <span className="absolute -top-1/3 inset-x-0 h-1/2 bg-white/35 blur-md rounded-full" />
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10" />
      <Glyph name={icon} className="relative w-7 h-7 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
    </span>
  );
}

export default function ClientBadges() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [defs, setDefs] = useState([]);
  const [earned, setEarned] = useState(new Map());
  const [cat, setCat] = useState('All');
  const [show, setShow] = useState('all');

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: ub }] = await Promise.all([
        supabase.from('badge_definitions').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('user_badges').select('badge_code, earned_at').eq('user_id', profile.id),
      ]);
      setDefs(d ?? []);
      setEarned(new Map((ub ?? []).map(b => [b.badge_code, b.earned_at])));
      setLoading(false);
    })();
  }, [profile.id]);

  const cats = useMemo(() => ['All', ...new Set(defs.map(d => d.category))], [defs]);
  const filtered = defs.filter(d =>
    (cat === 'All' || d.category === cat) &&
    (show === 'all' || (show === 'earned' ? earned.has(d.code) : !earned.has(d.code)))
  );

  const earnedCount = earned.size;
  const pct = defs.length ? Math.round((earnedCount / defs.length) * 100) : 0;
  const tierBreakdown = TIER_ORDER.map(t => ({
    tier: t,
    earned: defs.filter(d => d.tier === t && earned.has(d.code)).length,
    total: defs.filter(d => d.tier === t).length,
  }));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      {/* ── Premium hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-8">
        <span className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-300">
              <Sparkles className="w-4 h-4" /> Achievements
            </p>
            <p className="mt-3 font-display text-5xl md:text-6xl font-extrabold leading-none">
              {profile.points ?? 0}<span className="text-2xl text-slate-400 font-bold ml-2">pts</span>
            </p>
            <p className="mt-2 text-sm text-slate-300">
              <strong className="text-white">{earnedCount}</strong> of {defs.length} badges unlocked
            </p>
          </div>
          {/* progress ring */}
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold">{pct}%</span>
          </div>
        </div>
        {/* tier chips */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {tierBreakdown.map(t => (
            <span key={t.tier} className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 backdrop-blur">
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${TIERS[t.tier].grad}`} />
              {TIERS[t.tier].label} <span className="text-slate-300">{t.earned}/{t.total}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                cat === c ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {['all', 'earned', 'locked'].map(s => (
            <button key={s} onClick={() => setShow(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors duration-200 ${
                show === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filtered.map(d => {
          const got = earned.has(d.code);
          const t = TIERS[d.tier];
          return (
            <div
              key={d.code}
              className={`relative rounded-2xl border p-4 text-center transition-all duration-200 ${
                got
                  ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                  : 'bg-slate-50/60 border-dashed border-slate-200'
              }`}
            >
              {got && (
                <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>
                  {t.label}
                </span>
              )}
              <Medallion icon={d.icon} tier={d.tier} earned={got} size="w-16 h-16 mx-auto" />
              <p className={`mt-3 font-bold text-sm leading-tight ${got ? 'text-slate-900' : 'text-slate-500'}`}>{d.name}</p>
              <p className="mt-1 text-xs text-slate-500 leading-snug">{d.description}</p>
              {got ? (
                <p className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                  {new Date(earned.get(d.code)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  <span className="text-slate-300">·</span><span className={t.text}>+{d.points}</span>
                </p>
              ) : (
                <p className="mt-2.5 text-[11px] font-semibold text-slate-400">{d.points} pts · locked</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Celebratory modal — premium medallion reveal when new badges earned.
export function BadgeEarnModal({ codes, defs, onClose }) {
  if (!codes?.length) return null;
  const earnedDefs = codes.map(c => defs.find(d => d.code === c)).filter(Boolean);
  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-[95] bg-slate-900/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center animate-fade-up" onClick={e => e.stopPropagation()}>
          <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-500">
            <Sparkles className="w-4 h-4" /> Achievement unlocked
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-5">
            {earnedDefs.map(d => (
              <div key={d.code} className="flex flex-col items-center w-24">
                <Medallion icon={d.icon} tier={d.tier} earned size="w-20 h-20" />
                <p className="mt-2.5 text-xs font-bold leading-tight">{d.name}</p>
                <p className={`text-[11px] font-bold ${TIERS[d.tier].text}`}>+{d.points} pts</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="btn-primary w-full mt-7">Claim it</button>
        </div>
      </div>
    </>
  );
}
