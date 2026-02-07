// API Configuration
// Handles both development and production environments

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Get API URL from environment variable
// Priority: 1. Env var, 2. Empty string for unified deployment, 3. localhost fallback
const getApiBaseUrl = () => {
  // If env var is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production (unified deployment on Vercel/Render)
  if (isProduction) {
    return ''; // Empty = same origin, calls go to /api/*
  }
  
  // Development fallback
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// App configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'HRMS Lite';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Debug logging (remove in production if desired)
console.log('[Config] Environment:', isProduction ? 'production' : 'development');
console.log('[Config] API Base URL:', API_BASE_URL || '(same origin)');
console.log('[Config] App:', APP_NAME, 'v' + APP_VERSION);
