export const API_BASE_URL_LOCAL = 'http://localhost:5000/api/v1';

export const API_BASE_URL_DEV = import.meta.env.VITE_BASE_URL_DEV || API_BASE_URL_LOCAL;

export const API_BASE_URL_MAIN = import.meta.env.VITE_BACKEND_BASE_URL_MAIN || API_BASE_URL_LOCAL;