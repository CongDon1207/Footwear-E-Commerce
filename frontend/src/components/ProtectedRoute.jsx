import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProtectedRedirectPath } from '../utils/routeGuards';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const redirectPath = getProtectedRedirectPath({ isAuthenticated, loading });

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
