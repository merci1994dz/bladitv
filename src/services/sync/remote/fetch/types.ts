
/**
 * Type definitions for remote fetch operations
 */

// Define global ENV type for Vercel skew protection
declare global {
  interface Window {
    ENV?: {
      VERCEL_SKEW_PROTECTION_ENABLED?: string;
      VERCEL_DEPLOYMENT_ID?: string;
    };
  }
}

// Types for fetch options based on browser detection
export interface BrowserInfo {
  isSafari: boolean;
  isIE: boolean;
  isEdge: boolean;
}

// Response from JSONP callback
export interface JsonpResponse {
  success: boolean;
  data: any;
  error?: string;
}
