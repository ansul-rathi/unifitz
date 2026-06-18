import { useEffect, useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  Home, Trophy, TrendingUp, Gift, User, Calendar, Users, Megaphone,
  LayoutDashboard, ListChecks, UserCog, Share2, IndianRupee, Flame, LogOut, Dumbbell,
  Salad, Medal, Mailbox, BarChart3, X, CalendarCheck, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Avatar } from './ui';

const NAV = {
  client: [
    { to: '/app', label: 'Home', icon: Home, end: true },
    { to: '/app/challenges', label: 'Series', icon: Trophy },
    { to: '/app/progress', label: 'Progress', icon: TrendingUp },
    { to: '/app/diet', label: 'Diet Plan', icon: Salad },
    { to: '/app/badges', label: 'Badges', icon: Medal },
    { to: '/app/refer', label: 'Refer & Earn', icon: Gift },
    { to: '/app/profile', label: 'Profile', icon: User },
  ],
  teacher: [
    { to: '/teacher', label: 'Schedule', icon: Calendar, end: true },
    { to: '/teacher/students', label: 'My Students', icon: Users },
    { to: '/teacher/announcements', label: 'Announce', icon: Megaphone },
    { to: '/teacher/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/challenges', label: 'Series', icon: ListChecks },
    { to: '/admin/users', label: 'Users', icon: UserCog },
    { to: '/admin/referrals', label: 'Referrals', icon: Share2 },
    { to: '/admin/badges', label: 'Badges', icon: Medal },
    { to: '/admin/leads', label: 'Leads', icon: Mailbox },
    { to: '/admin/revenue', label: 'Revenue', icon: IndianRupee },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ],
};

const HOME_BASE = { client: '/app', teacher: '/teacher', admin: '/admin' };

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const [streak, setStreak] = useState(null);
  const [showStreak, setShowStreak] = useState(false);
  const items = NAV[profile.role] ?? NAV.client;
  // Mobile/tablet bottom tabs drop Profile + Refer for clients (reached via the
  // header avatar instead). Desktop sidebar keeps the full list unchanged.
  const bottomItems = profile.role === 'client'
    ? items.filter(i => !['/app/refer', '/app/profile'].includes(i.to))
    : items;

  useEffect(() => {
    if (profile.role !== 'client') return;
    supabase.rpc('current_streak', { p_user: profile.id }).then(({ data }) => setStreak(data ?? 0));
  }, [profile.id, profile.role]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
            <Dumbbell className="w-6 h-6 text-brand-500" />
            Uni<span className="text-brand-500">Fitz</span>
          </Link>

          <div className="flex items-center gap-3">
            {profile.role === 'client' && streak !== null && (
              <button
                onClick={() => setShowStreak(true)}
                aria-label={`Day ${streak} streak — view details`}
                title="Your streak"
                className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-bold pl-2 pr-2.5 py-1.5 rounded-full active:scale-95 hover:bg-orange-100 transition duration-150"
              >
                <Flame className="w-4 h-4 text-orange-500" />
                {streak}
              </button>
            )}
            {/* Mobile/tablet (client): avatar links to Profile, no header logout */}
            {profile.role === 'client' && (
              <Link
                to="/app/profile"
                aria-label="Your profile"
                title="Profile"
                className="lg:hidden rounded-full ring-2 ring-transparent hover:ring-brand-200 transition-shadow duration-200"
              >
                <Avatar name={profile.full_name} url={profile.avatar_url} />
              </Link>
            )}
            {/* Desktop client + all teacher/admin: avatar links to Profile + logout */}
            <div className={`items-center gap-2 ${profile.role === 'client' ? 'hidden lg:flex' : 'flex'}`}>
              <Link
                to={`${HOME_BASE[profile.role] ?? '/app'}/profile`}
                aria-label="Your profile"
                title="Profile"
                className="rounded-full ring-2 ring-transparent hover:ring-brand-200 transition-shadow duration-200"
              >
                <Avatar name={profile.full_name} url={profile.avatar_url} />
              </Link>
              <button
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Streak detail popup */}
      {showStreak && streak !== null && (() => {
        const MILES = [3, 7, 14, 21, 30, 60, 100];
        const next = MILES.find(m => m > streak) ?? null;
        const pct = next ? Math.min(100, Math.round((streak / next) * 100)) : 100;
        return (
          <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" onClick={() => setShowStreak(false)}>
            <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 animate-fade-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg">Your streak</h3>
                <button onClick={() => setShowStreak(false)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>

              <div className="mt-4 flex flex-col items-center text-center">
                <span className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-orange-100">
                  <Flame className="w-10 h-10 text-orange-500" />
                </span>
                <p className="mt-3 font-display text-4xl font-extrabold text-slate-900">{streak} {streak === 1 ? 'day' : 'days'}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {streak > 0 ? "You're on fire — don't break the chain!" : 'Check in today to start your streak.'}
                </p>
              </div>

              {next && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Next milestone</span>
                    <span>{streak}/{next} days</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">{next - streak} more {next - streak === 1 ? 'day' : 'days'} to reach {next} 🔥</p>
                </div>
              )}

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">How streaks work</p>
                <p className="flex items-start gap-2 text-sm text-slate-600"><CalendarCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Check in or join a class each day to keep it going.</p>
                <p className="flex items-start gap-2 text-sm text-slate-600"><Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" /> Miss a day and the streak resets to zero.</p>
              </div>

              <button onClick={() => setShowStreak(false)} className="btn-primary w-full mt-5">Got it</button>
            </div>
          </div>
        );
      })()}

      <div className="max-w-6xl mx-auto lg:flex">
        {/* Sidebar — desktop (lg+) */}
        <aside className="hidden lg:block w-56 shrink-0 px-3 py-6">
          <nav className="flex flex-col gap-1 sticky top-20">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 md:px-6 py-5 md:py-8 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Bottom tabs — mobile + tablet (below lg) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-flow-col shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottomItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-brand-600' : 'text-slate-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
