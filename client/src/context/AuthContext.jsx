/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Uses useReducer for state management.
 * 
 * Features:
 * - Login/logout
 * - Token refresh
 * - User profile loading
 * - Permission computation
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authReducer, authActions, computePermissions } from '../reducers/authReducer.js';
import * as authAPI from '../api/auth.api.js';
import * as userAPI from '../api/user.api.js';
import { registerRefreshHandler } from '../utils/api.js';

const AuthContext = createContext(null);

// Ignored for now next I'll split it into hooks and controllers 
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as loading to check auth status
    isRefreshing: false,
    error: null,
  });

  /**
   * Login user
   * After login, loads full user profile to get officer-specific fields (department, writeNews, etc.)
   */
  const login = useCallback(async (credentials) => {
    dispatch({ type: authActions.LOGIN_START });
    try {
      const response = await authAPI.login(credentials);
      const basicUserData = response.data.user;

      // Store access token if provided (for tests)
      if (response.data.accessToken) {
        // Token is in cookies, but we can store it for API calls if needed
        // For now, rely on cookies
      }

      // Load full user profile to get officer-specific fields (department, writeNews, etc.)
      // This is critical for officers to get their permissions
      try {
        const profileResponse = await userAPI.getUserProfile();
        const fullUserData = profileResponse.data;

        // Use full profile data which includes officer fields
        dispatch({ type: authActions.LOGIN_SUCCESS, payload: fullUserData });
        return { success: true, data: fullUserData };
      } catch (profileError) {
        // If profile load fails, use basic data but log warning
        console.warn('Failed to load full profile after login, using basic data:', profileError);
        dispatch({ type: authActions.LOGIN_SUCCESS, payload: basicUserData });
        return { success: true, data: basicUserData };
      }
    } catch (error) {
      dispatch({ type: authActions.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: authActions.LOGOUT });
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData) => {
    dispatch({ type: authActions.LOGIN_START });
    try {
      const response = await authAPI.register(userData);
      const userData_response = response.data.user;

      dispatch({ type: authActions.LOGIN_SUCCESS, payload: userData_response });
      return { success: true, data: userData_response };
    } catch (error) {
      dispatch({ type: authActions.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async () => {
    dispatch({ type: authActions.REFRESH_TOKEN_START });
    try {
      const response = await authAPI.refreshToken();
      const userData = response.data.user;

      dispatch({ type: authActions.REFRESH_TOKEN_SUCCESS, payload: userData });
      return { success: true, data: userData };
    } catch (error) {
      dispatch({ type: authActions.REFRESH_TOKEN_FAILURE}); // I removed the error message from payload to avoid showing token refresh errors to users in login page
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Load current user profile
   */
  const loadUser = useCallback(async () => {
    dispatch({ type: authActions.LOAD_USER_START });
    try {
      const response = await userAPI.getUserProfile();
      const userData = response.data;

      dispatch({ type: authActions.LOAD_USER_SUCCESS, payload: userData });
      return { success: true, data: userData };
    } catch (error) {
      dispatch({ type: authActions.LOAD_USER_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: authActions.CLEAR_ERROR });
  }, []);

  // Compute permissions from user data
  const permissions = React.useMemo(() => {
    return computePermissions(state.user);
  }, [state.user]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    return permissions[permission] === true;
  }, [permissions]);

  // Load user on mount if authenticated
  useEffect(() => {
    // Register the refresh token handler with the API utility
    // This allows api.js to automatically retry failed requests with valid tokens
    registerRefreshHandler(refreshAccessToken);

    const initializeAuth = async () => {
      // Try to load user profile to check if we're authenticated
      const result = await loadUser();
      if (!result.success) {
        // Not authenticated or token expired
        dispatch({ type: authActions.LOAD_USER_FAILURE, payload: null });
      }
    };

    initializeAuth();
  }, [loadUser, refreshAccessToken]);

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,

    // Computed
    permissions,
    role: state.user?.role,

    // Methods
    login,
    logout,
    register,
    refreshAccessToken,
    loadUser,
    clearError,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

