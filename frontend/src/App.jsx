import { Navigate, Route, Routes } from './routing';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlayersPage from './pages/PlayersPage';
import SquadsPage from './pages/SquadsPage';
import TrainingPage from './pages/TrainingPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import DisciplinePage from './pages/DisciplinePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import UsersPage from './pages/UsersPage';
import ActivityPage from './pages/ActivityPage';
import EditorPage from './pages/EditorPage';
import PlansPage from './pages/PlansPage';
import LibraryPage from './pages/LibraryPage';
import MatchDayPage from './pages/MatchDayPage';
import MicrocyclePage from './pages/MicrocyclePage';
import GameModelPage from './pages/GameModelPage';
import AnimationsPage from './pages/AnimationsPage';
import VideoPage from './pages/VideoPage';
import AccountPage from './pages/AccountPage';

const ROLES = ['admin', 'coach', 'captain', 'player'];

function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={`/${ROLES.includes(user?.role) ? user.role : 'player'}/dashboard`} replace />;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route index element={<RoleRedirect />} />
      {ROLES.map((role) => <Route key={role} element={<ProtectedRoute roles={[role]} />}>
        <Route path={`${role}/dashboard`} element={<DashboardPage />} />
      </Route>)}
      <Route element={<ProtectedRoute roles={['admin','coach']} />}><Route path="players" element={<PlayersPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin','coach','captain']} />}><Route path="squads" element={<SquadsPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="editor" element={<EditorPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="plans" element={<PlansPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="library" element={<LibraryPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="matchday" element={<MatchDayPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="microcycle" element={<MicrocyclePage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="gamemodel" element={<GameModelPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="animations" element={<AnimationsPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="video" element={<VideoPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}><Route path="account" element={<AccountPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin','coach','captain','player']} />}><Route path="training" element={<TrainingPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin','coach','captain','player']} />}><Route path="attendance" element={<AttendancePage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin','coach','captain']} />}><Route path="reports" element={<ReportsPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin','coach']} />}><Route path="discipline" element={<DisciplinePage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin','coach','captain','player']} />}><Route path="announcements" element={<AnnouncementsPage />} /></Route>
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="users" element={<UsersPage />} />
        <Route path="activity" element={<ActivityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route></Route>
  </Routes>;
}
