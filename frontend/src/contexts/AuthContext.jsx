// Task ID: c0c28f55
import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Auth context provider for managing authentication state.
 * Stores user data and provides login/logout/register functions.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Failed to load user:', err);
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Register a new user.
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registered user data
   */
  const register = async (userData) => {
    try {
      setError(null);
      const registeredUser = await authService.register(userData);
      // Auto-login after registration
      await login({ email: userData.email, password: userData.password });
      return registeredUser;
    } catch (err) {
      setError(err.detail || 'Registration failed');
      throw err;
    }
  };

  /**
   * Login user with credentials.
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Token data
   */
  const login = async (credentials) => {
    try {
      setError(null);
      await authService.login(credentials);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.detail || 'Login failed');
      throw err;
    }
  };

  /**
   * Logout current user.
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  /**
   * Clear error state.
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context.
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
