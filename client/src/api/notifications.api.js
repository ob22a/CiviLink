/**
 * Notifications API client
 * 
 * Handles all notification-related operations:
 * - Get notifications (paginated)
 * - Mark notification as read
 * - Mark all as read
 * - Delete notification
 */

import {apiRequest} from '../utils/api.js';

/**
 * Get user notifications
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 5)
 * @param {boolean} params.unreadOnly - Filter unread only
 * @returns {Promise<Object>} Paginated notifications
 */
export const getNotifications = async (params = {}) => {
  const { page = 1, limit = 5, unreadOnly = false } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(unreadOnly && { unreadOnly: 'true' }),
  });

  return apiRequest(`/notifications?${queryParams}`, {
    method: 'GET',
  });
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}/mark-read`, {
    method: 'PATCH',
  });
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Update result with modified count
 */
export const markAllNotificationsAsRead = async () => {
  return apiRequest('/notifications/mark-all-read', {
    method: 'PATCH',
  });
};

/**
 * Delete a notification (soft delete)
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteNotification = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE',
  });
};

