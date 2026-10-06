/**
 * sahajAI Frontend API Configuration
 * Centralized backend URL and all API endpoints
 */

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:1338';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '754929770183-m5p32a7dl7asj2vlmonums5upv5st2rp.apps.googleusercontent.com';

export const API_ENDPOINTS = {
  // Authentication & Database Status
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    GOOGLE: '/api/auth/google',
    ME: '/api/auth/me',
    DB_STATUS: '/api/db/status',
  },

  // AI chathistory & Completions
  CONVERSATION: {
    STREAM: '/backend-api/v2/conversation',
    MODELS: '/backend-api/v2/models',
    CONFIG: '/backend-api/v2/config',
  },

  // Workspaces Management
  WORKSPACES: {
    BASE: '/api/workspaces',
    BY_ID: (id: number | string) => `/api/workspaces/${id}`,
    CONVERSATIONS: (workspaceId: number | string) => `/api/workspaces/${workspaceId}/conversations`,
  },

  // Specific Conversations & Messages
  CONVERSATIONS: {
    BY_ID: (id: string | number) => `/api/conversations/${id}`,
  },

  // Admin Dashboard & Management
  ADMIN: {
    STATS: '/api/admin/stats',
    USERS: '/api/admin/users',
    USER_ROLE: (userId: number | string) => `/api/admin/users/${userId}/role`,
    USER_BY_ID: (userId: number | string) => `/api/admin/users/${userId}`,
    WORKSPACES: '/api/admin/workspaces',
  },

  // Localization & Language Support
  LOCALIZATION: {
    CHANGE_LANGUAGE: '/change-language',
    GET_LOCALE: '/get-locale',
    GET_LANGUAGES: '/get-languages',
  },
} as const;

/**
 * Generates the full API URL for a given endpoint.
 * In development with Vite proxy, useProxy is true by default and returns relative paths.
 */
export const getApiUrl = (endpoint: string, useProxy: boolean = true): string => {
  if (useProxy) {
    return endpoint;
  }
  const baseUrl = BACKEND_BASE_URL.replace(/\/$/, '');
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default {
  BASE_URL: BACKEND_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  getApiUrl,
};
