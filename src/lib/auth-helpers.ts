/**
 * Get the correct redirect URL for OAuth callbacks
 * In production, uses the actual domain; in development, can use localhost or a tunneling service
 * Handles HashRouter by including # in the URL path
 * 
 * Environment variables:
 * - VITE_OAUTH_REDIRECT_DOMAIN: Custom domain (e.g., https://abc123.ngrok.io)
 *   If set, this will ALWAYS be used instead of window.location.origin
 */
export const getOAuthRedirectUrl = (path: string = '/auth/callback'): string => {
  // Priority 1: Use custom domain if set (ngrok, tunnel, etc.)
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const customDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.trim();
    // Remove trailing slash if present
    const cleanDomain = customDomain.endsWith('/') ? customDomain.slice(0, -1) : customDomain;
    // For HashRouter, include # before the path
    return `${cleanDomain}/#${path}`;
  }
  
  // Priority 2: Use window.location.origin with # for HashRouter
  // HashRouter uses URLs like: origin/#/route
  return `${window.location.origin}/#${path}`;
};

/**
 * Get all valid OAuth redirect URLs for Supabase Google OAuth configuration
 * This is useful when setting up your Google OAuth credentials
 * Includes both /auth/callback (Supabase redirect) and dashboard redirect URLs
 */
export const getOAuthRedirectUrls = (): string[] => {
  const urls = [
    // Development URLs - Auth callback (primary Supabase redirect)
    'http://localhost:3000/#/auth/callback',
    'http://localhost:5173/#/auth/callback',
    'http://127.0.0.1:5173/#/auth/callback',
    'http://127.0.0.1:3000/#/auth/callback',
    
    // Development URLs - Dashboard (secondary redirect after auth)
    'http://localhost:3000/#/dashboard/journal',
    'http://localhost:5173/#/dashboard/journal',
    'http://127.0.0.1:5173/#/dashboard/journal',
    'http://127.0.0.1:3000/#/dashboard/journal',
    
    // Production - add your actual domain
    // 'https://yourdomain.com/#/auth/callback',
    // 'https://yourdomain.com/#/dashboard/journal',
  ];
  
  // Add custom domain if set
  if (import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN) {
    const cleanDomain = import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.endsWith('/') 
      ? import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN.slice(0, -1)
      : import.meta.env.VITE_OAUTH_REDIRECT_DOMAIN;
    urls.push(`${cleanDomain}/#/auth/callback`);
    urls.push(`${cleanDomain}/#/dashboard/journal`);
  }
  
  return urls;
};

/**
 * Setup instructions for Google OAuth
 * Log this to help developers configure their Google OAuth credentials
 */
export const logOAuthSetupInstructions = () => {
  if (import.meta.env.DEV) {
    console.group('🔐 Google OAuth Setup Instructions');
    console.log('Add these redirect URIs to your Google OAuth credentials:');
    getOAuthRedirectUrls().forEach(url => console.log(`  • ${url}`));
    console.log('\nOr set VITE_OAUTH_REDIRECT_DOMAIN in .env for custom domains (e.g., ngrok tunnels)');
    console.groupEnd();
  }
};
