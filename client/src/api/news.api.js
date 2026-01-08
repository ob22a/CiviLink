import {apiRequest} from '../utils/api.js';

/**
 * Get latest news articles
 * @returns {Promise<Object>} News items
 */
export const getLatestNews = async () => {
    return apiRequest('/officer/news/latest', {
        method: 'GET',
    });
};

/**
 * Create a new news article
 * @param {Object} newsData - News data (title, content, headerImageUrl)
 * @returns {Promise<Object>} Created news info
 */
export const createNews = async (newsData) => {
    return apiRequest('/officer/news', {
        method: 'POST',
        body: JSON.stringify(newsData),
    });
};

/**
 * Update an existing news article
 * @param {string} id - News ID
 * @param {Object} newsData - Updated news data
 * @returns {Promise<Object>} Updated news info
 */
export const editNews = async (id, newsData) => {
    return apiRequest(`/officer/news/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(newsData),
    });
};

/**
 * Delete a news article
 * @param {string} id - News ID
 * @returns {Promise<Object>} Success message
 */
export const deleteNews = async (id) => {
    return apiRequest(`/officer/news/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Request a signed upload URL for news images
 * @param {string} fileName - Original file name
 * @returns {Promise<Object>} Upload URL and token
 */
export const requestUploadUrl = async (fileName) => {
    return apiRequest('/officer/news/upload-url', {
        method: 'POST',
        body: JSON.stringify({ fileName }),
    });
};
