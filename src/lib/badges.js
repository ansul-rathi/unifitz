import { supabase } from './supabase';

export const TIERS = {
  bronze: {
    label: 'Bronze', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-600',
    ring: 'ring-amber-700/30',
    grad: 'from-amber-400 via-amber-600 to-amber-800',
    glow: 'shadow-[0_8px_24px_-6px_rgba(180,83,9,0.55)]',
  },
  silver: {
    label: 'Silver', text: 'text-slate-500', bg: 'bg-slate-50', dot: 'bg-slate-400',
    ring: 'ring-slate-400/40',
    grad: 'from-slate-200 via-slate-400 to-slate-600',
    glow: 'shadow-[0_8px_24px_-6px_rgba(100,116,139,0.5)]',
  },
  gold: {
    label: 'Gold', text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400',
    ring: 'ring-amber-400/50',
    grad: 'from-yellow-200 via-amber-400 to-amber-600',
    glow: 'shadow-[0_10px_28px_-6px_rgba(245,158,11,0.6)]',
  },
  platinum: {
    label: 'Platinum', text: 'text-sky-600', bg: 'bg-sky-50', dot: 'bg-sky-400',
    ring: 'ring-sky-400/50',
    grad: 'from-cyan-200 via-sky-400 to-indigo-500',
    glow: 'shadow-[0_10px_30px_-6px_rgba(56,189,248,0.6)]',
  },
  diamond: {
    label: 'Diamond', text: 'text-violet-600', bg: 'bg-violet-50', dot: 'bg-violet-400',
    ring: 'ring-violet-400/50',
    grad: 'from-fuchsia-300 via-violet-400 to-cyan-300',
    glow: 'shadow-[0_12px_34px_-6px_rgba(167,139,250,0.7)]',
  },
};

export const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// Run the rules engine for the current user; returns array of newly-earned codes.
export async function evaluateBadges(userId) {
  const { data, error } = await supabase.rpc('evaluate_badges', { p_user: userId });
  if (error) return [];
  return data ?? [];
}

export async function nearestBadges(userId) {
  const { data, error } = await supabase.rpc('nearest_badges', { p_user: userId });
  if (error) return [];
  return data ?? [];
}
