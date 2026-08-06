import { useEffect, useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home, Trophy, TrendingUp, Gift, User, Calendar, Users, Megaphone,
  LayoutDashboard, ListChecks, UserCog, Share2, IndianRupee, Flame, LogOut, Dumbbell,
  Salad, Medal, Mailbox, BarChart3, X, CalendarCheck, Sparkles, ChefHat, Eye, Bell, Menu,
  ClipboardCheck, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useViewMode } from '../context/ViewModeContext';
import { supabase } from '../lib/supabase';
import { Avatar } from './ui';

const NAV = {
  client: [
    { to: '/app', label: 'Home', icon: Home, end: true },
    { to: '/app/series', label: 'Series', icon: Trophy },
    { to: '/app/progress', label: 'Progress', icon: TrendingUp },
    { to: '/app/diet', label: 'Diet Plan', icon: Salad },
    { to: '/app/recipes', label: 'Recipes', icon: ChefHat },
    { to: '/app/badges', label: 'Badges', icon: Medal },
    { to: '/app/refer', label: 'Refer & Earn', icon: Gift },
    { to: '/app/profile', label: 'Profile', icon: User },
  ],
  teacher: [
    { to: '/teacher', label: 'Schedule', icon: Calendar, end: true },
    { to: '/teacher/series', label: 'Series', icon: ListChecks },
    { to: '/teacher/students', label: 'My Students', icon: Users },
    { to: '/teacher/announcements', label: 'Announce', icon: Megaphone },
    { to: '/teacher/recipes', label: 'Recipes', icon: ChefHat },
    { to: '/teacher/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/series', label: 'Series', icon: ListChecks },
    { to: '/admin/users', label: 'Users', icon: UserCog },
    { to: '/admin/checkins', label: 'Check-ins', icon: ClipboardCheck },
    { to: '/admin/referrals', label: 'Referrals', icon: Share2 },
    { to: '/admin/badges', label: 'Badges', icon: Medal },
    { to: '/admin/recipes', label: 'Recipes', icon: ChefHat },
    { to: '/admin/leads', label: 'Leads', icon: Mailbox },
    { to: '/admin/revenue', label: 'Revenue', icon: IndianRupee },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ],
};

const HOME_BASE = { client: '/app', teacher: '/teacher', admin: '/admin' };

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const { preview, setPreview } = useViewMode();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(null);
  const [showStreak, setShowStreak] = useState(false);
  const [pendingCash, setPendingCash] = useState(0); // admin: cash payments awaiting verification
  const [unread, setUnread] = useState(0); // admin: unread activity notifications
  const [drawerOpen, setDrawerOpen] = useState(false); // admin mobile hamburger nav
  const [accountOpen, setAccountOpen] = useState(false); // client mobile account sheet

  const isStaff = profile.role === 'teacher' || profile.role === 'admin';
  // While a staff member previews the student app, render the client nav/shell.
  const effectiveRole = preview && isStaff ? 'client' : profile.role;
  const items = NAV[effectiveRole] ?? NAV.client;
  // Mobile/tablet bottom tabs drop Profile + Refer for clients (reached via the
  // header avatar instead). Desktop sidebar keeps the full list unchanged.
  const bottomItems = effectiveRole === 'client'
    ? items.filter(i => !['/app/refer', '/app/profile'].includes(i.to))
    : items;
  // Admin has too many nav items for bottom tabs (they overflowed and hid
  // Notifications). On mobile the admin shell uses a hamburger drawer instead.
  const useDrawer = effectiveRole === 'admin';

  function enterPreview() { setPreview(true); navigate('/app'); }
  function exitPreview() { setPreview(false); navigate(HOME_BASE[profile.role] ?? '/'); }

  useEffect(() => {
    if (effectiveRole !== 'client' || profile.role !== 'client') return;
    supabase.rpc('current_streak', { p_user: profile.id }).then(({ data }) => setStreak(data ?? 0));
  }, [profile.id, profile.role, effectiveRole]);

  // Admin: badge the Revenue nav item with the count of cash payments still
  // awaiting verification, so the queue that enrolls paying students is visible
  // without digging into the Revenue tab.
  useEffect(() => {
    if (profile.role !== 'admin') return;
    const fetchPending = () => supabase
      .from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification')
      .then(({ count }) => setPendingCash(count ?? 0));
    fetchPending();
    const channel = supabase.channel('admin-pending-cash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchPending)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile.role]);

  // Admin: live unread-notification count for the Notifications nav badge.
  useEffect(() => {
    if (profile.role !== 'admin') return;
    const fetchUnread = () => supabase
      .from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false)
      .then(({ count }) => setUnread(count ?? 0));
    fetchUnread();
    const channel = supabase.channel('admin-unread-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchUnread)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile.role]);

  const badgeFor = to => {
    if (to === '/admin/revenue' && pendingCash > 0) return pendingCash;
    if (to === '/admin/notifications' && unread > 0) return unread;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:bg-gradient-to-br lg:from-slate-50 lg:via-orange-50/30 lg:to-slate-100">
      {/* Top bar — mobile/tablet only; desktop uses the full-height sidebar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 lg:hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {useDrawer && (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="relative p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
                {(unread + pendingCash) > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
              <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-sm shadow-orange-500/30">
                <Dumbbell className="w-4.5 h-4.5" />
              </span>
              Uni<span className="text-brand-500">fitz</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {useDrawer && (
              <Link to="/admin/notifications" aria-label="Notifications" title="Notifications" className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">{unread}</span>
                )}
              </Link>
            )}
            {isStaff && !preview && (
              <button
                onClick={enterPreview}
                title="Preview the student experience"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-2.5 sm:px-3 py-2 rounded-lg transition-colors duration-150"
              >
                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View as student</span>
              </button>
            )}
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
            {/* Mobile/tablet (client): avatar opens the account sheet — the only
                route to Profile, Refer & Earn and sign-out, since bottom tabs
                can't hold them. */}
            {effectiveRole === 'client' && (
              <button
                onClick={() => setAccountOpen(true)}
                aria-label="Account menu"
                aria-haspopup="dialog"
                title="Account"
                className="lg:hidden rounded-full ring-2 ring-transparent hover:ring-brand-200 active:scale-95 transition duration-200"
              >
                <Avatar name={profile.full_name} url={profile.avatar_url} />
              </button>
            )}
            {/* Desktop client + all teacher/admin: avatar links to Profile + logout */}
            <div className={`items-center gap-2 ${effectiveRole === 'client' ? 'hidden lg:flex' : 'flex'}`}>
              <Link
                to={`${HOME_BASE[effectiveRole] ?? '/app'}/profile`}
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

      {/* Admin mobile nav drawer — replaces the overflowing bottom tabs */}
      {useDrawer && drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-2xl flex flex-col">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-sm shadow-orange-500/30"><Dumbbell className="w-4.5 h-4.5" /></span>
                Uni<span className="text-brand-500">fitz</span>
              </span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 space-y-1">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                      isActive ? 'bg-gradient-to-r from-brand-500 to-orange-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{label}</span>
                  {badgeFor(to) && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">{badgeFor(to)}</span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="px-3 pb-5 pt-3 border-t border-slate-200 space-y-2">
              {isStaff && !preview && (
                <button onClick={() => { setDrawerOpen(false); enterPreview(); }}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-2.5 rounded-xl">
                  <Eye className="w-4 h-4" /> View as student
                </button>
              )}
              <button onClick={signOut}
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-2.5 rounded-xl">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Client mobile account sheet — profile, Refer & Earn, streak, sign out */}
      {accountOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-slate-900/50 flex items-end justify-center" role="dialog" aria-modal="true" onClick={() => setAccountOpen(false)}>
          <div className="bg-white w-full rounded-t-3xl p-5 pb-8 animate-fade-up" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg">Account</h3>
              <button onClick={() => setAccountOpen(false)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            {/* Profile — same card the desktop sidebar shows */}
            <Link
              to="/app/profile"
              onClick={() => setAccountOpen(false)}
              className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 active:scale-[0.99] transition"
            >
              <Avatar name={profile.full_name} url={profile.avatar_url} size="w-12 h-12" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 truncate">{profile.full_name || 'Member'}</p>
                <p className="text-xs font-semibold text-slate-500">View and edit your profile</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
            </Link>

            {/* Refer & Earn */}
            <Link
              to="/app/refer"
              onClick={() => setAccountOpen(false)}
              className="mt-2.5 flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-3.5 active:scale-[0.99] transition"
            >
              <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-sm shadow-orange-500/30">
                <Gift className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">Refer &amp; Earn</p>
                <p className="text-xs font-semibold text-slate-500">Invite a friend, get rewarded</p>
              </div>
              <ChevronRight className="w-5 h-5 text-orange-400 shrink-0" />
            </Link>

            {profile.role === 'client' && streak !== null && (
              <button
                onClick={() => { setAccountOpen(false); setShowStreak(true); }}
                className="mt-2.5 w-full flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 active:scale-[0.99] transition"
              >
                <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-orange-100"><Flame className="w-5 h-5 text-orange-500" /></span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-bold text-slate-800">Your streak</p>
                  <p className="text-xs font-semibold text-slate-500">{streak} {streak === 1 ? 'day' : 'days'} going</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            )}

            {isStaff && preview && (
              <button onClick={() => { setAccountOpen(false); exitPreview(); }}
                className="mt-2.5 w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-3 rounded-2xl">
                <X className="w-4 h-4" /> Exit student preview
              </button>
            )}

            <button
              onClick={signOut}
              className="mt-2.5 w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-3 rounded-2xl"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* Student-preview banner (staff only) */}
      {preview && isStaff && (
        <div className="sticky top-14 md:top-16 lg:top-0 z-30 bg-brand-500 text-white text-sm font-semibold lg:ml-72">
          <div className="max-w-6xl mx-auto lg:mx-0 lg:max-w-none px-4 md:px-6 lg:px-10 py-2 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2"><Eye className="w-4 h-4" /> Student preview — how students see the app</span>
            <button onClick={exitPreview} className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors duration-150">
              <X className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>
      )}

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
                <p className="flex items-start gap-2 text-sm text-slate-600"><Sparkles className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" /> Miss a day and the streak resets to zero.</p>
              </div>

              <button onClick={() => setShowStreak(false)} className="btn-primary w-full mt-5">Got it</button>
            </div>
          </div>
        );
      })()}

      {/* Sidebar — desktop (lg+): fixed full-height glass panel */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col bg-white/60 backdrop-blur-2xl border-r border-white/70 shadow-[1px_0_24px_rgba(15,23,42,0.04)]">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <Link to="/" className="flex items-center gap-2.5 font-display text-2xl font-bold text-slate-900">
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
              <Dumbbell className="w-5 h-5" />
            </span>
            Uni<span className="text-brand-500">fitz</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{label}</span>
              {badgeFor(to) && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">{badgeFor(to)}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — actions + profile */}
        <div className="px-4 pb-5 pt-4 border-t border-slate-200/60 space-y-2">
          {isStaff && !preview && (
            <button
              onClick={enterPreview}
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-600 border border-slate-200/80 bg-white/70 hover:bg-white px-3 py-2.5 rounded-xl transition-colors duration-150"
            >
              <Eye className="w-4 h-4" /> View as student
            </button>
          )}
          {profile.role === 'client' && streak !== null && (
            <button
              onClick={() => setShowStreak(true)}
              aria-label={`Day ${streak} streak — view details`}
              className="w-full inline-flex items-center justify-between bg-orange-50/80 border border-orange-200/80 text-orange-700 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-orange-100/80 transition-colors duration-150"
            >
              <span className="inline-flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Streak</span>
              <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
            </button>
          )}
          <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-slate-200/70 p-3 shadow-sm">
            <Link
              to={`${HOME_BASE[effectiveRole] ?? '/app'}/profile`}
              className="flex items-center gap-3 flex-1 min-w-0 rounded-xl hover:opacity-80 transition-opacity duration-150"
              title="Your profile"
            >
              <Avatar name={profile.full_name} url={profile.avatar_url} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{profile.full_name || 'Member'}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">{effectiveRole}</p>
              </div>
            </Link>
            <button
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200 shrink-0"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main — flush against the sidebar, full width */}
      <main className="lg:pl-72">
        <div className={`px-4 md:px-6 lg:px-10 xl:px-12 py-5 md:py-8 lg:py-9 ${useDrawer ? 'pb-10' : 'pb-24'} lg:pb-12 max-w-6xl mx-auto lg:mx-0 lg:max-w-[1440px]`}>
          <Outlet />
        </div>
      </main>

      {/* Bottom tabs — mobile + tablet (below lg). Admin uses the drawer instead. */}
      {!useDrawer && (
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
            <span className="relative">
              <Icon className="w-5 h-5" />
              {badgeFor(to) && (
                <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">{badgeFor(to)}</span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      )}
    </div>
  );
}
