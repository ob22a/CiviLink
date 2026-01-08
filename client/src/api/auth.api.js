/**
 * Authentication API client
 * 
 * Handles all authentication-related API calls:
 * - User registration
 * - Login/logout
 * - Token refresh
 * - OAuth (Google)
 */

import {apiRequest} from '../utils/api.js';

/**
 * Register a new citizen user
 * @param {Object} userData - Registration data
 * @param {string} userData.fullName - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.confirmPassword - Password confirmation
 * @param {boolean} userData.acceptTerms - Terms acceptance flag
 * @returns {Promise<Object>} User data and tokens
 */
export const register = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @param {boolean} credentials.rememberMe - Remember me flag
 * @returns {Promise<Object>} User data and access token
 */
export const login = async (credentials) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

/**
 * Logout user
 * @returns {Promise<Object>} Success message
 */
export const logout = async () => {
  return apiRequest('/auth/logout', {
    method: 'POST',
  });
};

/**
 * Refresh access token
 * @returns {Promise<Object>} New user data and tokens
 */
export const refreshToken = async () => {
  return apiRequest('/auth/refresh-token', {
    method: 'POST',
  });
};

/**
 * Get Google OAuth URL
 * @returns {string} OAuth URL
 */
export const getGoogleAuthUrl = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  return `${API_BASE_URL}/auth/google`;
};

