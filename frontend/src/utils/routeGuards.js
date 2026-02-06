export const getProtectedRedirectPath = ({ isAuthenticated, loading }) => {
  if (loading || isAuthenticated) {
    return null;
  }

  return '/login';
};

export const getAdminRedirectPath = ({ isAuthenticated, loading, role }) => {
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return '/login';
  }

  if (role !== 'admin') {
    return '/';
  }

  return null;
};
