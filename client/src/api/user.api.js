/**
 * User API client
 * 
 * Handles user profile and settings operations:
 * - Get user profile
 * - Change password
 */

import {apiRequest} from '../utils/api.js';

/**
 * Get current user's profile information
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  return apiRequest('/user/profile', {
    method: 'GET',
  });
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @param {string} passwordData.confirmPassword - Password confirmation
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (passwordData) => {
  return apiRequest('/user/change-password', {
    method: 'PATCH',
    body: JSON.stringify(passwordData),
  });
};
/**
 * Get current user's extracted ID data (Fayda and Kebele)
 * @returns {Promise<Object>} ID data
 */
export const getIDData = async () => {
  return apiRequest('/user/id/data', {
    method: 'GET',
  });
};
