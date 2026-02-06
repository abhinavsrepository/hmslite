// API Configuration
// In production (Vercel), API is at /api
// In development, Vite proxy handles the forwarding

const isProduction = import.meta.env.PROD;

export const API_BASE_URL = isProduction 
  ? '/api'  // Unified Vercel deployment
  : (import.meta.env.VITE_API_URL || '');

// For debugging
console.log('Environment:', isProduction ? 'production' : 'development');
console.log('API Base URL:', API_BASE_URL);
