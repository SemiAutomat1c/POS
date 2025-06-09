/**
 * Navigation utilities for handling manual navigation in Next.js
 * This can be helpful when the Next.js router isn't working as expected
 */

/**
 * Navigate to a URL by setting window.location
 * This bypasses the Next.js router for cases where it's not working correctly
 */
export function navigateTo(url: string): void {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Navigate to the dashboard
 */
export function navigateToDashboard(): void {
  navigateTo('/dashboard');
}

/**
 * Navigate to the login page
 */
export function navigateToLogin(params?: Record<string, string>): void {
  let url = '/login';
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url += `?${searchParams.toString()}`;
  }
  navigateTo(url);
}

/**
 * Navigate to the registration page
 */
export function navigateToRegister(): void {
  navigateTo('/register');
}

/**
 * Reload the current page
 */
export function reloadPage(): void {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Check if the current URL contains a specific path
 */
export function isCurrentPath(path: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === path || window.location.pathname.startsWith(path);
}

/**
 * Get a query parameter from the URL
 */
export function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
} 