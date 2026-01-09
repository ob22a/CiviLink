import { apiRequest } from '../utils/api.js';
import { API_BASE_URL_DEV } from '../config/backend.js';

/**
 * Search for users (citizens)
 * @param {Object} params - Search parameters
 * @param {string} params.name - Name to search for
 * @param {string} params.email - Email to search for
 * @returns {Promise<Object>} List of matching users
 */
export const searchUser = async (params) => {
  const { name, email } = params;
  const queryParams = new URLSearchParams();
  if (name) queryParams.append('name', name);
  if (email) queryParams.append('email', email);

  return apiRequest(`/admin/user?${queryParams}`, {
    method: 'GET',
  });
};


/**
 * Assign a citizen to officer role
 * @param {Object} assignmentData - Assignment data
 * @param {string} assignmentData.userId - User ID to promote
 * @param {string} assignmentData.department - Department ('approver' or 'customer_support')
 * @param {string} assignmentData.subcity - Subcity assignment
 * @param {string} assignmentData.adminPassword - Admin password for verification
 * @returns {Promise<Object>} Created officer data
 */
export const assignOfficer = async (assignmentData) => {
  return apiRequest('/admin/officers/assign', {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  });
};

/**
 * Get performance metrics
 * @returns {Promise<Object>} Performance metrics data
 */
export const getPerformanceMetrics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key]) queryParams.append(key, params[key]);
  });
  const queryString = queryParams.toString();
  return apiRequest(`/admin/metrics/performance${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
};

/**
 * Get officer performance data
 * @returns {Promise<Object>} Officer performance data
 */
export const getOfficerPerformance = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key]) queryParams.append(key, params[key]);
  });
  const queryString = queryParams.toString();
  return apiRequest(`/admin/metrics/officers${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
};

/**
 * Export performance report as file
 * @returns {Promise<Blob>} Performance report file
 */
export const exportPerformanceReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key]) queryParams.append(key, params[key]);
  });
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL_DEV}/admin/metrics/performance/download${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Automatically sends HTTP-only cookies
  });

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  const blob = await response.blob();
  return blob;
};

/**
 * Get security logs (admin)
 * @param {Object} params - Query parameters (page, limit, startDate, endDate, etc.)
 * @returns {Promise<Object>} Security logs
 */
export const getSecurityLogs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  return apiRequest(`/admin/security${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
};

/**
 * Export security logs to file (admin)
 * @returns {Promise<Object>} Export result with filename
 */
export const exportSecurityLogs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });

  const queryString = queryParams.toString();
  return apiRequest(`/admin/security/export${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
};

/**
 * Download exported security log file (admin)
 * @param {string} filename - Filename to download
 * @returns {Promise<Response>} File response
 */
export const downloadSecurityLog = async (filename) => {
  const url = `${API_BASE_URL_DEV}/admin/security/download/${filename}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Automatically sends HTTP-only cookies
  });

  if (!response.ok) {
    throw new Error('Failed to download security log');
  }

  return response;
};