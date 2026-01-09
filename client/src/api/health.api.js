/**
 * Health API client
 * 
 * Handles health check and monitoring operations
 */

import { apiRequest } from '../utils/api.js';

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
    return apiRequest('/health', {
        method: 'GET',
    });
};
