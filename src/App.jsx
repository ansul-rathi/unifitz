import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/ui';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import RecipeDetail from './pages/RecipeDetail';
import StaffProfile from './pages/StaffProfile';
import DashboardLayout from './components/DashboardLayout';

import ClientHome from './pages/client/Home';
import ClientChallenges from './pages/client/Challenges';
import ChallengeDetail from './pages/client/ChallengeDetail';
import ClientProgress from './pages/client/Progress';
import ClientDiet from './pages/client/Diet';
import ClientBadges from './pages/client/Badges';
import ClientRefer from './pages/client/Refer';
import ClientProfile from './pages/client/Profile';

import TeacherSchedule from './pages/teacher/Schedule';
import TeacherStudents from './pages/teacher/Students';
import TeacherAnnouncements from './pages/teacher/Announcements';

import AdminOverview from './pages/admin/Overview';
import AdminChallenges from './pages/admin/Challenges';
import AdminUsers from './pages/admin/Users';
import AdminReferrals from './pages/admin/Referrals';
import AdminRevenue from './pages/admin/Revenue';
import AdminBadges from './pages/admin/Badges';
import AdminLeads from './pages/admin/Leads';

const HOME_BY_ROLE = { admin: '/admin', teacher: '/teacher', client: '/app' };

function Protected({ role, children }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <Spinner label="Checking your session…" />;
  if (!session) return <Navigate to="/auth" replace />;
  if (!profile) return <Spinner label="Loading profile…" />;
  if (profile.role === 'client' && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />;
  if (role && profile.role !== role) return <Navigate to={HOME_BY_ROLE[profile.role]} replace />;
  return children;
}

export default function App() {
  const { session, profile, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !loading && session && profile
            ? <Navigate to={HOME_BY_ROLE[profile.role] ?? '/app'} replace />
            : <Landing />
        }
      />
      <Route path="/auth" element={session && profile ? <Navigate to={HOME_BY_ROLE[profile.role]} replace /> : <Auth />} />
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
        <Route path="challenges" element={<ClientChallenges />} />
        <Route path="challenges/:id" element={<ChallengeDetail />} />
        <Route path="progress" element={<ClientProgress />} />
        <Route path="diet" element={<ClientDiet />} />
        <Route path="badges" element={<ClientBadges />} />
        <Route path="refer" element={<ClientRefer />} />
        <Route path="profile" element={<ClientProfile />} />
      </Route>

      <Route path="/teacher" element={<Protected role="teacher"><DashboardLayout /></Protected>}>
        <Route index element={<TeacherSchedule />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      <Route path="/admin" element={<Protected role="admin"><DashboardLayout /></Protected>}>
        <Route index element={<AdminOverview />} />
        <Route path="challenges" element={<AdminChallenges />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="referrals" element={<AdminReferrals />} />
        <Route path="badges" element={<AdminBadges />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="revenue" element={<AdminRevenue />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
