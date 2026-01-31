/**
 * Authentication Context for React
 * 
 * This provides a complete authentication system with:
 * - Login/Register/Logout
 * - Automatic token refresh
 * - Protected route handling
 * - Axios interceptors
 * 
 * Usage:
 * 1. Wrap your app with <AuthProvider>
 * 2. Use useAuth() hook in components
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken')
  );
  const [loading, setLoading] = useState(true);

  // Save tokens to state and localStorage
  const saveTokens = (access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  };

  // Clear tokens
  const clearTokens = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(
        `${api.defaults.baseURL}/users/refresh`,
        { refreshToken }
      );

      const newAccessToken = response.data.accessToken;
      setAccessToken(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);

      return newAccessToken;
    } catch (error) {
      // Refresh failed, logout user
      clearTokens();
      throw error;
    }
  };

  // Register
  const register = async (email, password, full_name) => {
    try {
      const response = await api.post('/users/register', {
        email,
        password,
        full_name,
      });

      const { accessToken, refreshToken, user } = response.data;
      saveTokens(accessToken, refreshToken);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });

      const { accessToken, refreshToken, user } = response.data;
      saveTokens(accessToken, refreshToken);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post(
        '/users/logout',
        { refreshToken },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  };

  // Logout all devices
  const logoutAll = async () => {
    try {
      await api.post(
        '/users/logout-all',
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      clearTokens();
    }
  };

  // Load user profile on mount
  useEffect(() => {
    const loadUser = async () => {
      if (accessToken) {
        try {
          const response = await api.get('/users/profile', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUser(response.data.user);
        } catch (error) {
          // Token might be expired, will be handled by interceptor
          console.error('Failed to load user:', error);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Axios request interceptor - add access token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken]);

  // Axios response interceptor - handle 401 and refresh
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refreshAccessToken();

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, user will be logged out by refreshAccessToken()
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken]);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    logoutAll,
    api, // Export configured axios instance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      // Redirect to login or show access denied
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

// Example usage in components:

/*
// App.js
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <YourRoutes />
    </AuthProvider>
  );
}

// LoginPage.js
import { useAuth } from './contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
}

// ProfilePage.js (protected route)
import { useAuth, withAuth } from './contexts/AuthContext';

function ProfilePage() {
  const { user, logout, api } = useAuth();

  const updateProfile = async () => {
    const response = await api.put('/users/profile', {
      full_name: 'New Name',
    });
    // Handle response
  };

  return (
    <div>
      <h1>Welcome, {user.full_name}</h1>
      <button onClick={logout}>Logout</button>
      <button onClick={updateProfile}>Update Profile</button>
    </div>
  );
}

export default withAuth(ProfilePage);
*/
