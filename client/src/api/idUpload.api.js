/**
 * ID Upload API client
 */

import { apiRequest } from '../utils/api.js';

/**
 * Get ID upload status
 */
export const getIDUploadStatus = async () => {
  return apiRequest('/user/id/data', {
    method: 'GET',
  });
};

/**
 * Upload Fayda ID
 */
export const uploadFaydaID = async (file) => {
  const formData = new FormData();
  formData.append('id_image', file);

  const response = await fetch(`api/user/id/upload/fayda`, {
    method: 'POST',
    body: formData,
    // credentials 'include' is required if your backend uses cookies/sessions
    credentials: 'include', 
    // We EXPLICITLY do not set headers here so the browser handles it
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed with status ${response.status}`);
  }

  return response.json();
};

/**
 * Upload Kebele ID
 */
export const uploadKebeleID = async (file) => {
  const formData = new FormData();
  formData.append('id_image', file);

  const response = await fetch(`api/user/id/upload/kebele`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed with status ${response.status}`);
  }

  return response.json();
};

/**
 * Delete ID information
 */
export const deleteIDInfo = async (idType) => {
  return apiRequest(`/user/id/${idType}`, {
    method: 'DELETE',
  });
};
