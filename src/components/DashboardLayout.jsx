import { useEffect, useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  Home, Trophy, TrendingUp, Gift, User, Calendar, Users, Megaphone,
  LayoutDashboard, ListChecks, UserCog, Share2, IndianRupee, Flame, LogOut, Dumbbell,
  Salad, Medal, Mailbox, BarChart3,
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
              <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                Day {streak} streak
              </span>
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
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-flow-col">
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
