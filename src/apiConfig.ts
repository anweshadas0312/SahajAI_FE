/**
 * sahajAI Frontend API Configuration
 * Centralized backend URL and all API endpoints
 */

export const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:1338').replace(/\/$/, '');
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '754929770183-m5p32a7dl7asj2vlmonums5upv5st2rp.apps.googleusercontent.com';

/**
 * Generates the full API URL for a given endpoint.
 * In development (Vite), relative paths are used so Vite proxy handles it.
 * In production builds (deployed on sahajai.aivistatech.com), requests are sent to BACKEND_BASE_URL.
 */
export const getApiUrl = (endpoint: string): string => {
  if (import.meta.env.DEV) {
    return endpoint;
  }
  return `${BACKEND_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

const p = (endpoint: string) => getApiUrl(endpoint);

export const API_ENDPOINTS = {
  // Authentication & Database Status
  AUTH: {
    LOGIN: p('/api/auth/login'),
    REGISTER: p('/api/auth/register'),
    GOOGLE: p('/api/auth/google'),
    ME: p('/api/auth/me'),
    DB_STATUS: p('/api/db/status'),
  },

  // AI chathistory & Completions
  CONVERSATION: {
    STREAM: p('/backend-api/v2/conversation'),
    MODELS: p('/backend-api/v2/models'),
    CONFIG: p('/backend-api/v2/config'),
  },

  // Workspaces Management
  WORKSPACES: {
    BASE: p('/api/workspaces'),
    BY_ID: (id: number | string) => p(`/api/workspaces/${id}`),
    CONVERSATIONS: (workspaceId: number | string) => p(`/api/workspaces/${workspaceId}/conversations`),
  },

  // Specific Conversations & Messages
  CONVERSATIONS: {
    BY_ID: (id: string | number) => p(`/api/conversations/${id}`),
  },

  // Files Management
  FILES: {
    UPLOAD: p('/api/files/upload'),
    BY_ID: (id: number | string) => p(`/api/files/${id}`),
  },

  // Admin Dashboard & Management
  ADMIN: {
    STATS: p('/api/admin/stats'),
    USERS: p('/api/admin/users'),
    USER_ROLE: (userId: number | string) => p(`/api/admin/users/${userId}/role`),
    USER_BY_ID: (userId: number | string) => p(`/api/admin/users/${userId}`),
    WORKSPACES: p('/api/admin/workspaces'),
    LLM_PROVIDERS: p('/api/admin/llm-providers'),
    LLM_PROVIDER_BY_ID: (id: number | string) => p(`/api/admin/llm-providers/${id}`),
    LLM_PROVIDER_TOGGLE: (id: number | string) => p(`/api/admin/llm-providers/${id}/toggle`),
    LLM_PROVIDER_TEST: (id: number | string) => p(`/api/admin/llm-providers/${id}/test`),
  },

  // Localization & Language Support
  LOCALIZATION: {
    CHANGE_LANGUAGE: p('/change-language'),
    GET_LOCALE: p('/get-locale'),
    GET_LANGUAGES: p('/get-languages'),
  },
} as const;

export default {
  BASE_URL: BACKEND_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  getApiUrl,
};
