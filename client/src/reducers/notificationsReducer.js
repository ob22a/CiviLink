/**
 * Notifications Reducer
 * 
 * Manages notification state:
 * - List of notifications
 * - Unread count
 * - Pagination state
 * - Loading and error states
 * 
 * Supports optimistic updates for better UX
 */

export const notificationActions = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  MARK_READ_START: 'MARK_READ_START',
  MARK_READ_SUCCESS: 'MARK_READ_SUCCESS',
  MARK_READ_FAILURE: 'MARK_READ_FAILURE',
  MARK_ALL_READ_START: 'MARK_ALL_READ_START',
  MARK_ALL_READ_SUCCESS: 'MARK_ALL_READ_SUCCESS',
  MARK_ALL_READ_FAILURE: 'MARK_ALL_READ_FAILURE',
  DELETE_START: 'DELETE_START',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  DELETE_FAILURE: 'DELETE_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const initialState = {
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
};

/**
 * Calculate unread count from notifications array
 * @param {Array} notifications - Array of notification objects
 * @returns {number} Count of unread notifications
 */
const calculateUnreadCount = (notifications) => {
  return notifications.filter(n => !n.read).length;
};

export const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case notificationActions.FETCH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case notificationActions.FETCH_SUCCESS:
      return {
        ...state,
        notifications: action.payload.notifications || [],
        pagination: {
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          hasNextPage: action.payload.hasNextPage || false,
          hasPrevPage: action.payload.hasPrevPage || false,
        },
        unreadCount: calculateUnreadCount(action.payload.notifications || []),
        isLoading: false,
        error: null,
      };

    case notificationActions.FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // Optimistic update: mark as read immediately
    case notificationActions.MARK_READ_START:
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload
            ? { ...notif, read: true }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case notificationActions.MARK_READ_SUCCESS:
      // Update with server response if different
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id
            ? { ...notif, ...action.payload }
            : notif
        ),
      };

    case notificationActions.MARK_READ_FAILURE:
      // Revert optimistic update
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id
            ? { ...notif, read: false }
            : notif
        ),
        unreadCount: state.unreadCount + 1,
        error: action.payload.error,
      };

    // Optimistic update: mark all as read immediately
    case notificationActions.MARK_ALL_READ_START:
      return {
        ...state,
        notifications: state.notifications.map(notif => ({
          ...notif,
          read: true,
        })),
        unreadCount: 0,
      };

    case notificationActions.MARK_ALL_READ_SUCCESS:
      return {
        ...state,
        // Server confirms all are read, state already updated optimistically
      };

    case notificationActions.MARK_ALL_READ_FAILURE:
      // Revert: recalculate unread count
      return {
        ...state,
        notifications: state.notifications.map(notif => ({
          ...notif,
          read: false,
        })),
        unreadCount: calculateUnreadCount(state.notifications),
        error: action.payload,
      };

    // Optimistic update: remove from list immediately
    case notificationActions.DELETE_START:
      return {
        ...state,
        notifications: state.notifications.filter(
          notif => notif.id !== action.payload
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount - (state.notifications.find(n => n.id === action.payload)?.read === false ? 1 : 0)
        ),
      };

    case notificationActions.DELETE_SUCCESS:
      // Already removed optimistically, just update pagination if needed
      return {
        ...state,
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
        },
      };

    case notificationActions.DELETE_FAILURE:
      // Revert: need to refetch to restore
      return {
        ...state,
        error: action.payload,
        // Note: In production, you might want to refetch here
      };

    case notificationActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

