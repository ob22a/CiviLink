export const API_BASE_URL_LOCAL = import.meta.env.VITE_BACKEND_BASE_URL_LOCAL;

export const API_BASE_URL_DEV = import.meta.env.VITE_BACKEND_BASE_URL_DEV || API_BASE_URL_LOCAL;

export const API_BASE_URL_MAIN = import.meta.env.VITE_BACKEND_BASE_URL_MAIN || API_BASE_URL_LOCAL;