// Small shared UI primitives used across all dashboards.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Music, Flower2, Brain, Dumbbell, Weight, Activity, ChevronRight } from 'lucide-react';

// Class types + their at-a-glance icons (tooltip reinforces, icon stands alone).
export const CLASS_TYPES = [
  { value: 'Zumba', icon: Music },
  { value: 'Yoga', icon: Flower2 },
  { value: 'Meditation', icon: Brain },
  { value: 'Strength Training', icon: Dumbbell },
  { value: 'Weight Training', icon: Weight },
];

export function CategoryIcon({ category, className = 'w-4 h-4' }) {
  const t = CLASS_TYPES.find(c => c.value === category);
  const Icon = t?.icon ?? Activity;
  return (
    <span title={category || 'Class'} aria-label={category || 'Class'} tabIndex={0} className="inline-flex">
      <Icon className={className} />
    </span>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {Icon && <Icon className="w-10 h-10 text-slate-300 mb-3" />}
      <p className="font-semibold text-slate-700">{title}</p>
      {hint && <p className="text-sm text-slate-500 mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, sub, accent = 'text-brand-500', alert = false, to, onClick }) {
  const clickable = !!(to || onClick);
  const inner = (
    <>
      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
        {Icon && <Icon className={`w-4 h-4 ${alert ? 'text-red-500' : accent}`} />}
        {label}
        {clickable && <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300" />}
      </div>
      <p className={`mt-2 font-display text-2xl md:text-3xl font-bold ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </>
  );
  const cls = `block p-4 md:p-5 rounded-2xl border bg-white ${alert ? 'border-red-200 bg-red-50' : 'border-slate-200'} ${clickable ? 'shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200 cursor-pointer' : 'shadow-sm'}`;
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={`${cls} text-left w-full`}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export function ProgressBar({ value, max, className = '' }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`h-2 rounded-full bg-slate-100 overflow-hidden ${className}`}>
      <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

const BADGE_META = {
  first_kg: { label: 'First KG Lost', emoji: null, color: 'bg-emerald-100 text-emerald-700' },
  streak_7: { label: '7-Day Streak', emoji: null, color: 'bg-orange-100 text-orange-700' },
  streak_30: { label: '30-Day Streak', emoji: null, color: 'bg-red-100 text-red-700' },
  challenge_finisher: { label: 'Challenge Finisher', emoji: null, color: 'bg-violet-100 text-violet-700' },
  super_referrer: { label: 'Super Referrer', emoji: null, color: 'bg-sky-100 text-sky-700' },
};

export function BadgePill({ type }) {
  const meta = BADGE_META[type] || { label: type, color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
  );
}

// Rectangle (16:9) session poster thumbnail; gradient + day number when no poster.
export function SessionThumb({ poster, day, live = false, size = 'w-24 h-14 md:w-28 md:h-16' }) {
  if (poster) {
    return <img src={poster} alt={`Day ${day} session poster`} loading="lazy" className={`${size} shrink-0 rounded-lg object-cover border border-slate-100`} />;
  }
  return (
    <span
      className={`${size} shrink-0 rounded-lg flex flex-col items-center justify-center font-display font-bold text-white ${
        live ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-brand-400 to-brand-600'
      }`}
      aria-hidden="true"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80 leading-none">Day</span>
      <span className="text-xl leading-tight">{day}</span>
    </span>
  );
}

export function Avatar({ name, url, size = 'w-9 h-9' }) {
  if (url) return <img src={url} alt={name} className={`${size} rounded-full object-cover`} />;
  return (
    <span className={`${size} rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0`}>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

export function CountdownTimer({ target, onZero }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(target) - Date.now()));

  useEffect(() => {
    const t = setInterval(() => {
      const ms = Math.max(0, new Date(target) - Date.now());
      setLeft(ms);
      if (ms === 0) {
        clearInterval(t);
        onZero?.();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [target, onZero]);

  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = n => String(n).padStart(2, '0');

  return (
    <span className="font-mono font-bold tabular-nums">
      {d > 0 && `${d}d `}{pad(h)}:{pad(m)}:{pad(sec)}
    </span>
  );
}

const CONFETTI_COLORS = ['#F97316', '#22C55E', '#3B82F6', '#EAB308', '#EC4899'];

export function Confetti({ count = 60 }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 animate-confetti"
          style={{
            left: `${(i * 1.7 + 3) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 10) * 0.15}s`,
            borderRadius: i % 2 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
