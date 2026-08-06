import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useViewMode } from './context/ViewModeContext';
import { Spinner } from './components/ui';
import DashboardLayout from './components/DashboardLayout';

// Route-level code splitting — each page ships as its own chunk, so the first
// load (landing/auth) no longer downloads the entire app + recharts + jspdf.
const Landing = lazy(() => import('./pages/Landing'));
const MorningSession = lazy(() => import('./pages/MorningSession'));
const Auth = lazy(() => import('./pages/Auth'));
const AuthConfirm = lazy(() => import('./pages/AuthConfirm'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const StaffProfile = lazy(() => import('./pages/StaffProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ClientHome = lazy(() => import('./pages/client/Home'));
const ClientSeries = lazy(() => import('./pages/client/Series'));
const ClientSeriesDetail = lazy(() => import('./pages/client/SeriesDetail'));
const SessionPlayer = lazy(() => import('./pages/client/SessionPlayer'));
const ClientProgress = lazy(() => import('./pages/client/Progress'));
const ClientDiet = lazy(() => import('./pages/client/Diet'));
const ClientBadges = lazy(() => import('./pages/client/Badges'));
const ClientRefer = lazy(() => import('./pages/client/Refer'));
const ClientRecipes = lazy(() => import('./pages/client/Recipes'));
const ClientProfile = lazy(() => import('./pages/client/Profile'));

const StaffRecipes = lazy(() => import('./pages/staff/Recipes'));

const TeacherSchedule = lazy(() => import('./pages/teacher/Schedule'));
const TeacherStudents = lazy(() => import('./pages/teacher/Students'));
const TeacherAnnouncements = lazy(() => import('./pages/teacher/Announcements'));
const TeacherSeries = lazy(() => import('./pages/teacher/Series'));

const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminSeries = lazy(() => import('./pages/admin/Series'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCheckins = lazy(() => import('./pages/admin/Checkins'));
const AdminUserDetail = lazy(() => import('./pages/admin/UserDetail'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminReferrals = lazy(() => import('./pages/admin/Referrals'));
const AdminRevenue = lazy(() => import('./pages/admin/Revenue'));
const AdminBadges = lazy(() => import('./pages/admin/Badges'));
const AdminLeads = lazy(() => import('./pages/admin/Leads'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSeriesDetail = lazy(() => import('./pages/admin/SeriesDetail'));
const SeriesMembersPage = lazy(() => import('./pages/admin/SeriesMembersPage'));

const HOME_BY_ROLE = { admin: '/admin', teacher: '/teacher', client: '/app' };

// Old "challenges" URLs are renamed to "series". Redirect bookmarked links,
// preserving the :id where present.
function RedirectToSeries({ base }) {
  const { id } = useParams();
  return <Navigate to={id ? `${base}/${id}` : base} replace />;
}

function Protected({ role, children }) {
  const { session, profile, loading } = useAuth();
  const { preview } = useViewMode();
  if (loading) return <Spinner label="Checking your session…" />;
  if (!session) return <Navigate to="/auth" replace />;
  if (!profile) return <Spinner label="Loading profile…" />;
  if (profile.role === 'client' && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />;
  if (role && profile.role !== role) {
    // Teacher/admin previewing the student experience may enter the client app.
    if (preview && role === 'client' && profile.role !== 'client') return children;
    return <Navigate to={HOME_BY_ROLE[profile.role]} replace />;
  }
  return children;
}

export default function App() {
  const { session, profile, loading } = useAuth();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
      <Routes>
        {/* Marketing landing page at root. Logged-in users go straight to
            their dashboard; everyone else sees the landing (not /auth). */}
        <Route
          path="/"
          element={
            !loading && session && profile
              ? <Navigate to={HOME_BY_ROLE[profile.role] ?? '/app'} replace />
              : <Landing />
          }
        />
        <Route path="/landing" element={<Landing />} />
        {/* Shareable open link for the free 5 AM session — public even when logged in. */}
        <Route path="/morning" element={<MorningSession />} />
        <Route path="/auth" element={session && profile ? <Navigate to={HOME_BY_ROLE[profile.role]} replace /> : <Auth />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/recipes/:code" element={<RecipeDetail />} />
        <Route
          path="/onboarding"
          element={
            !session ? <Navigate to="/auth" replace />
            : profile?.onboarding_complete ? <Navigate to="/app" replace />
            : <Onboarding />
          }
        />

        <Route path="/app" element={<Protected role="client"><DashboardLayout /></Protected>}>
          <Route index element={<ClientHome />} />
          <Route path="series" element={<ClientSeries />} />
          <Route path="series/:id" element={<ClientSeriesDetail />} />
          {/* Legacy /app/challenges links → /app/series */}
          <Route path="challenges" element={<RedirectToSeries base="/app/series" />} />
          <Route path="challenges/:id" element={<RedirectToSeries base="/app/series" />} />
          <Route path="session/:id" element={<SessionPlayer />} />
          <Route path="progress" element={<ClientProgress />} />
          <Route path="diet" element={<ClientDiet />} />
          <Route path="recipes" element={<ClientRecipes />} />
          <Route path="badges" element={<ClientBadges />} />
          <Route path="refer" element={<ClientRefer />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>

        <Route path="/teacher" element={<Protected role="teacher"><DashboardLayout /></Protected>}>
          <Route index element={<TeacherSchedule />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="announcements" element={<TeacherAnnouncements />} />
          <Route path="series" element={<TeacherSeries />} />
          <Route path="series/:id" element={<AdminSeriesDetail />} />
          <Route path="series/:id/members" element={<SeriesMembersPage />} />
          <Route path="recipes" element={<StaffRecipes />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        <Route path="/admin" element={<Protected role="admin"><DashboardLayout /></Protected>}>
          <Route index element={<AdminOverview />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="series" element={<AdminSeries />} />
          <Route path="series/:id" element={<AdminSeriesDetail />} />
          <Route path="series/:id/members" element={<SeriesMembersPage />} />
          {/* Legacy /admin/challenges → /admin/series */}
          <Route path="challenges" element={<RedirectToSeries base="/admin/series" />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="checkins" element={<AdminCheckins />} />
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="badges" element={<AdminBadges />} />
          <Route path="recipes" element={<StaffRecipes />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
