
/**
 * Main export file for remote fetching utilities
 */

// Export fetch utilities
export { isRemoteUrlAccessible } from './accessibilityCheck';
export { fetchRemoteData } from './fetchRemoteData';

// Re-export other utilities
export * from './browserDetection';
export * from './skewProtection';
export * from './proxyUtils';
export * from './errorHandling';
export * from './fetchStrategies';

/**
 * Fetch with timeout utility
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeout Timeout in milliseconds
 * @returns Promise resolving to Response
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
};
