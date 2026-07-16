import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from '../pages/Auth/AuthPage';
import ProjectsPage from '../pages/Projects/ProjectsPage';
import ActivityPage from '../pages/Activity/ActivityPage';
import EventsPage from '../pages/Events/EventsPage';
import RatingPage from '../pages/Rating/RatingPage';
import ReportsPage from '../pages/Reports/ReportsPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import ApplicationsPage from '../pages/Applications/ApplicationsPage';
import SchedulePage from '../pages/Schedule/SchedulePage';
import TeachersPage from '../pages/Teachers/TeachersPage';
import { useAppSelector } from '../app/hooks';
import type { ReactElement } from 'react';

const PrivateRoute = ({ element }: { element: ReactElement }) => {
  const token = useAppSelector((state) => state.auth.token);
  return token ? element : <Navigate to="/auth" replace />;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/projects" element={<PrivateRoute element={<ProjectsPage />} />} />
      <Route path="/applications" element={<PrivateRoute element={<ApplicationsPage />} />} />
      <Route path="/activity" element={<PrivateRoute element={<ActivityPage />} />} />
      <Route path="/events" element={<PrivateRoute element={<EventsPage />} />} />
      <Route path="/schedule" element={<PrivateRoute element={<SchedulePage />} />} />
      <Route path="/teachers" element={<PrivateRoute element={<TeachersPage />} />} />
      <Route path="/rating" element={<PrivateRoute element={<RatingPage />} />} />
      <Route path="/reports" element={<PrivateRoute element={<ReportsPage />} />} />
      <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRouter;
