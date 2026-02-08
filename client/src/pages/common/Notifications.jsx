/**
 * Notifications Page
 * 
 * Dedicated page showing all user notifications.
 * 
 * Features:
 * - Paginated list of all notifications
 * - Mark as read / mark all as read
 * - Delete notifications
 * - Filter by unread
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { AuthGuard } from '../../guards/AuthGuard.jsx';
import AuthenticatedLayout from '../../components/layout/AuthenticatedLayout.jsx';
import '../../styles/common/Notifications.css';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch notifications when filter or page changes
  useEffect(() => {
    fetchNotifications({
      page: currentPage,
      limit: 10,
      unreadOnly: filter === 'unread',
    });
  }, [currentPage, filter, fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    await markAsRead(notificationId);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDelete = useCallback(async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
    }
  }, [deleteNotification]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AuthGuard>
      <AuthenticatedLayout showSidebar={true}>
        <div className="notifications-page">
          <div className="notifications-container">
            <div className="notifications-header">
              <h1>Notifications</h1>
              <div className="notifications-actions">
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setFilter('all');
                      setCurrentPage(1);
                    }}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => {
                      setFilter('unread');
                      setCurrentPage(1);
                    }}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
                {unreadCount > 0 && filter === 'all' && (
                  <button
                    className="mark-all-read-btn"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {isLoading && notifications.length === 0 ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-bell-slash"></i>
                <h2>No notifications</h2>
                <p>
                  {filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-card ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-card-header">
                        <div className="notification-title-section">
                          <h3 className="notification-title">{notification.title}</h3>
                          {!notification.read && (
                            <span className="unread-badge">New</span>
                          )}
                        </div>
                        <div className="notification-actions">
                          {!notification.read && (
                            <button
                              className="action-btn"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-footer">
                        <span className="notification-time">
                          <i className="fas fa-clock"></i>
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage || isLoading}
                    >
                      <i className="fas fa-chevron-left"></i>
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage || isLoading}
                    >
                      Next
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </AuthGuard>
  );
};

export default Notifications;

