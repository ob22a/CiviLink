/**
 * Officer API client
 * 
 * Handles officer-specific operations:
 * - Get officer applications
 * - Get application details
 */

import { apiRequest } from '../utils/api.js';

/**
 * Get all applications assigned to the current officer
 * @returns {Promise<Object>} List of applications
 */
export const getOfficerApplications = async (page = 1, limit = 10) => {
  return apiRequest(`/officer/applications?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
};

/**
 * Get details of a specific application
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Application details
 */
export const getApplicationDetails = async (applicationId) => {
  return apiRequest(`/officer/applications/${applicationId}`, {
    method: 'GET',
  });
};
/**
 * Approve a TIN application (officer)
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Result
 */
export const approveTinApplication = async (applicationId) => {
  return apiRequest(`/tin/applications/${applicationId}/approve`, {
    method: 'POST',
  });
};

/**
 * Reject a TIN application (officer)
 * @param {string} applicationId - Application ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Result
 */
export const rejectTinApplication = async (applicationId, reason) => {
  return apiRequest(`/tin/applications/${applicationId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

/**
 * Get metrics for the current officer
 * @returns {Promise<Object>} Metrics data
 */
export const getOfficerMetrics = async () => {
  return apiRequest('/officer/metrics', {
    method: 'GET',
  });
};

/**
 * Get recent activity logs for the current officer
 * @returns {Promise<Object>} List of activities
 */
export const getOfficerActivities = async () => {
  return apiRequest('/officer/activities', {
    method: 'GET',
  });
};

/**
 * Approve a vital record application (officer)
 * @param {string} type - Type of vital record ("birth", "marriage", "death")
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Result
 */
export const approveVitalApplication = async (type, applicationId) => {
  return apiRequest(`/vital/${type}/applications/${applicationId}/approve`, {
    method: 'POST',
  });
};

/**
 * Reject a vital record application (officer)
 * @param {string} type - Type of vital record ("birth", "marriage", "death")
 * @param {string} applicationId - Application ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Result
 */
export const rejectVitalApplication = async (type, applicationId, reason) => {
  return apiRequest(`/vital/${type}/applications/${applicationId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

