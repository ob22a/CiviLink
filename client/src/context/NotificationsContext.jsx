/**
 * Notifications Context
 * 
 * Provides notification state and methods throughout the application.
 * Uses useReducer for state management with optimistic updates.
 * 
 * Features:
 * - Fetch notifications (paginated)
 * - Mark as read (optimistic)
 * - Mark all as read (optimistic)
 * - Delete notification (optimistic)
 * - Unread count tracking
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { notificationsReducer, notificationActions } from '../reducers/notificationsReducer.js';
import * as notificationsAPI from '../api/notifications.api.js';
import { useAuth } from '../hooks/useAuth';

export const NotificationsContext = createContext(null);

// Hook removed and moved to src/hooks/useNotifications.js

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(notificationsReducer, {
    notifications: [],
    unreadCount: 0,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    isLoading: false,
    error: null,
  });

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (params = {}) => {
    dispatch({ type: notificationActions.FETCH_START });
    try {
      const response = await notificationsAPI.getNotifications(params);
      dispatch({
        type: notificationActions.FETCH_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: notificationActions.FETCH_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Mark notification as read (optimistic update)
   */
  const markAsRead = useCallback(async (notificationId) => {
    // Optimistic update
    dispatch({
      type: notificationActions.MARK_READ_START,
      payload: notificationId,
    });

    try {
      const response = await notificationsAPI.markNotificationAsRead(notificationId);
      dispatch({
        type: notificationActions.MARK_READ_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: notificationActions.MARK_READ_FAILURE,
        payload: { id: notificationId, error: error.message },
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Mark all notifications as read (optimistic update)
   */
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    dispatch({ type: notificationActions.MARK_ALL_READ_START });

    try {
      const response = await notificationsAPI.markAllNotificationsAsRead();
      dispatch({
        type: notificationActions.MARK_ALL_READ_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: notificationActions.MARK_ALL_READ_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Delete notification (optimistic update)
   */
  const deleteNotification = useCallback(async (notificationId) => {
    // Optimistic update
    dispatch({
      type: notificationActions.DELETE_START,
      payload: notificationId,
    });

    try {
      const response = await notificationsAPI.deleteNotification(notificationId);
      dispatch({
        type: notificationActions.DELETE_SUCCESS,
        payload: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({
        type: notificationActions.DELETE_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: notificationActions.CLEAR_ERROR });
  }, []);

  // Auto-fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications({ page: 1, limit: 5 });
    }
  }, [isAuthenticated, fetchNotifications]);

  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,

    // Methods
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

