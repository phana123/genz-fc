import { Navigate, Outlet } from '../routing';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading-screen">GEN Z FC</div>;
  if (!user) return <Navigate to="/login" replace />;
  const role = ['admin', 'coach', 'captain', 'player'].includes(user.role) ? user.role : 'player';
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
