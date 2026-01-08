import { apiRequest } from '../utils/api';

/**
 * Get all conversations for the authenticated officer
 * @returns {Promise<Object>} Conversations list
 */
export const getConversations = async (page = 1, limit = 10) => {
    return apiRequest(`/chats?page=${page}&limit=${limit}`, {
        method: 'GET',
    });
};

/**
 * Get a specific conversation by ID (including full history)
 * @param {string} conversationId 
 * @returns {Promise<Object>} Conversation details
 */
export const getConversationById = async (conversationId) => {
    return apiRequest(`/chats/${conversationId}`, {
        method: 'GET',
    });
};

/**
 * Post a message to a conversation (Officer response)
 * @param {string} conversationId 
 * @param {string} messageContent 
 * @returns {Promise<Object>} Status response
 */
export const postMessage = async (conversationId, messageContent) => {
    return apiRequest(`/chats/${conversationId}`, {
        method: 'POST',
        body: JSON.stringify({ messageContent }),
    });
};

/**
 * Get all conversations for the authenticated citizen
 * @returns {Promise<Object>} Conversations list
 */
export const getCitizenConversations = async (page = 1, limit = 10) => {
    return apiRequest(`/chats/my-conversations?page=${page}&limit=${limit}`, {
        method: 'GET',
    });
};

/**
 * Submit a support inquiry (for both authenticated users and guests)
 * @param {Object} payload Inquiry data (subject, message, guestName, guestEmail)
 * @returns {Promise<Object>} Success response
 */
export const submitInquiry = async (payload) => {
    return apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

/**
 * Mark a conversation as read (Officer)
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Success response
 */
export const markConversationAsRead = async (conversationId) => {
    return apiRequest(`/chats/${conversationId}/read`, {
        method: 'PATCH',
    });
};

