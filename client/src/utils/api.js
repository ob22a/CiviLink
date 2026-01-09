import { API_BASE_URL } from '../config/backend.js';

/**
 * Normalizes API errors to a consistent format
 * @param {Error|Response} error - The error object or response
 * @returns {Object} Normalized error object
 */
export const normalizeError = (error) => {
  if (error.response) {
    // Axios-style error (if we add axios later)
    return {
      message: error.response.data?.message || error.response.data?.error?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    };
  }

  if (error instanceof Response) {
    // Fetch API error
    return {
      message: 'Network error occurred',
      status: error.status,
      data: null
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    status: null,
    data: null
  };
};

/**
 * Makes an API request with automatic token handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized with Token Refresh
    // Skip if this IS the refresh request (prevent infinite loop)
    if (response.status === 401 && !options._retry && refreshHandler && !endpoint.includes('refresh-token')) {
      try {
        const refreshResult = await refreshHandler();
        if (refreshResult && refreshResult.success) {
          // Retry original request with _retry flag
          return apiRequest(endpoint, { ...options, _retry: true });
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
        throw new Error('Session expired. Please log in again.');
      }
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (response.ok) {
        return { success: true, data: null };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || data.error?.message || 'Request failed');
      error.response = response;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw normalized errors
    throw normalizeError(error);
  }
};

let refreshHandler = null;

/**
 * Registers a function to handle token refresh attempts
 * @param {Function} handler - Function that returns Promise<{success: boolean}>
 */
export const registerRefreshHandler = (handler) => {
  refreshHandler = handler;
};