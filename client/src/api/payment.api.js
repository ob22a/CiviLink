import { apiRequest } from '../utils/api.js';

/**
 * Initialize a payment (citizen)
 * @param {Object} paymentData - { applicationId, serviceType, phoneNumber, amount }
 * @returns {Promise<Object>} Payment info with checkoutUrl
 */
export const processPayment = async (paymentData) => {
    return apiRequest('/payments/pay', {
        method: 'POST',
        body: JSON.stringify(paymentData),
    });
};

/**
 * Verify payment status with Chapa (sets success/failed)
 * @param {string} txRef - Transaction reference
 * @returns {Promise<Object>} Verification status
 */
export const verifyPayment = async (txRef) => {
    return apiRequest(`/payments/verify/${txRef}`, {
        method: 'GET',
    });
};

/**
 * Get payment by application ID
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Payment info
 */
export const getPaymentByApplicationId = async (applicationId) => {
    return apiRequest(`/payments/application/${applicationId}`, {
        method: 'GET',
    });
};

/**
 * Get payment status (citizen/officer/admin)
 * @param {string} id - Payment document ID
 * @returns {Promise<Object>} Status info
 */
export const getPaymentStatus = async (id) => {
    return apiRequest(`/payments/${id}/status`, {
        method: 'GET',
    });
};

/**
 * Get payment history (citizen)
 * @returns {Promise<Object>} History list
 */
export const getPaymentHistory = async (page = 1, limit = 10) => {
    return apiRequest(`/payments/history?page=${page}&limit=${limit}`, {
        method: 'GET',
    });
};

/**
 * Download PDF receipt (success payments only)
 * @param {string} id - Payment document ID
 */
export const downloadReceipt = async (id) => {
    const url = `api/payments/${id}/receipt`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Automatically sends HTTP-only cookies
    });

    if (!response.ok) {
        throw new Error('Failed to download receipt');
    }

    return response;
};
