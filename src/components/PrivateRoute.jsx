import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function PrivateRoute({ allowedRoles }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading || (currentUser && !userData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary-600 border-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // If they are a student trying to access teacher route, send to student dash
    if (userData.role === 'student') return <Navigate to="/dashboard" replace />;
    // If they are a teacher trying to access student route, send to teacher dash
    if (userData.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
  }

  return <Outlet />;
}
