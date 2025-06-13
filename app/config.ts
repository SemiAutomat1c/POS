/**
 * Application configuration
 */

// Auth configuration
export const AUTH_CONFIG = {
  // Minimum password length
  MIN_PASSWORD_LENGTH: 6,
  
  // Password reset token expiration (in seconds)
  PASSWORD_RESET_EXPIRATION: 3600 * 24, // 24 hours
  
  // Routes that don't require authentication
  PUBLIC_ROUTES: [
    '/login',
    '/register',
    '/direct-register',
    '/api-test',
    '/dashboard/demo',
    '/demo',
    '/',
    '/custom-signup',
    '/auth-test',
    '/dashboard-redirect',
    '/forgot-password',
    '/reset-password',
  ],
  
  // Routes that should redirect to dashboard if user is logged in
  AUTH_REDIRECT_ROUTES: [
    '/',
    '/register',
    '/login',
    '/custom-signup',
  ],
  
  // Routes that authenticated users should be able to access directly
  AUTHENTICATED_ACCESS_ROUTES: [
    '/dashboard/subscription',
  ],
  
  // Routes that require authentication but shouldn't redirect to dashboard
  PROTECTED_ROUTES: [
    '/dashboard/subscription',
  ],
};

// Site configuration
export const SITE_CONFIG = {
  // Site name
  NAME: 'GadgetTrack POS',
  
  // Site description
  DESCRIPTION: 'Modern Point of Sale System',
};

// API configuration
export const API_CONFIG = {
  // Maximum requests per minute
  RATE_LIMIT: 60,
};

// Default configuration
export default {
  AUTH: AUTH_CONFIG,
  SITE: SITE_CONFIG,
  API: API_CONFIG,
}; 