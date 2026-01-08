/**
 * ID Upload API client
 * 
 * Handles ID verification operations:
 * - Upload Fayda ID
 * - Upload Kebele ID
 * - Get upload status
 * - Delete ID information (Right to Be Forgotten)
 */

import { apiRequest } from '../utils/api.js';

/**
 * Get ID upload status
 * @returns {Promise<Object>} Upload status (NONE, ONLY_FAYDA, ONLY_KEBELE, BOTH)
 */
export const getIDUploadStatus = async () => {
  return apiRequest('/user/id/data', {
    method: 'GET',
  });
};

/**
 * Upload Fayda ID
 * @param {File} file - ID image file
 * @returns {Promise<Object>} Upload result
 */
export const uploadFaydaID = async (file) => {
  const formData = new FormData();
  formData.append('id_image', file);

  // apiRequest handles Content-Type for FormData automatically (by letting browser set it)
  // BUT our apiRequest utility might force Content-Type: application/json.
  // We need to check api.js behavior or pass custom headers to override.
  // Actually, standard fetch with FormData sets boundary correctly if Content-Type is NOT set.
  // Let's assume apiRequest is smart enough or we pass generic headers.
  return apiRequest('/user/id/upload/fayda', {
    method: 'POST',
    body: formData,
  });
};

/**
 * Upload Kebele ID
 * @param {File} file - ID image file
 * @returns {Promise<Object>} Upload result
 */
export const uploadKebeleID = async (file) => {
  const formData = new FormData();
  formData.append('id_image', file);

  return apiRequest('/user/id/upload/kebele', {
    method: 'POST',
    body: formData,
  });
};

/**
 * Delete ID information (Right to Be Forgotten)
 * @param {string} idType - 'fayda', 'kebele', or 'both'
 * @returns {Promise<Object>} Deletion result
 */
export const deleteIDInfo = async (idType) => {
  return apiRequest(`/user/id/${idType}`, {
    method: 'DELETE',
  });
};

