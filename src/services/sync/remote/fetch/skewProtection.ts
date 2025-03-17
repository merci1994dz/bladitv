
/**
 * Utilities for handling Vercel skew protection
 */

/**
 * Get skew protection parameters for Vercel deployments
 * 
 * @returns String with deployment ID parameter or empty string
 */
export const getSkewProtectionParams = (): string => {
  if (typeof window !== 'undefined' && window.ENV && 
      window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1' && 
      window.ENV.VERCEL_DEPLOYMENT_ID) {
    return `dpl=${window.ENV.VERCEL_DEPLOYMENT_ID}`;
  }
  return '';
};

/**
 * Add skew protection headers if enabled
 * 
 * @param headers Headers object to modify
 * @returns Updated headers object
 */
export const addSkewProtectionHeaders = (headers: Record<string, string>): Record<string, string> => {
  if (typeof window !== 'undefined' && window.ENV && window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1') {
    if (window.ENV.VERCEL_DEPLOYMENT_ID) {
      headers['x-deployment-id'] = window.ENV.VERCEL_DEPLOYMENT_ID;
      console.log('تم تفعيل حماية التزامن Vercel Skew Protection');
    }
  }
  return headers;
};
