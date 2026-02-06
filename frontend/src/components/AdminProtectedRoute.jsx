import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminRedirectPath } from '../utils/routeGuards';

/**
 * AdminProtectedRoute - Protects routes that require admin role
 * Redirects to login if not authenticated, or to home if not admin
 */
export default function AdminProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const redirectPath = getAdminRedirectPath({
    isAuthenticated,
    loading,
    role: user?.role,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }
  return redirectPath ? <Navigate to={redirectPath} replace /> : children;
}
