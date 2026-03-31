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

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/rating" element={<RatingPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRouter;
