
/**
 * JSONP fallback for CORS limitations
 */

/**
 * Attempt to load data using JSONP as a fallback method
 * 
 * @param url URL to fetch data from
 * @param timeout Timeout in milliseconds
 * @returns Promise resolving with the data
 */
export const loadWithJsonp = (url: string, timeout = 10000): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = `bladiInfoCallback_${Date.now()}`;
    const jsonpUrl = `${url}&callback=${callbackName}`;
    
    // Create script element
    const script = document.createElement('script');
    script.src = jsonpUrl;
    
    // Define callback function
    (window as any)[callbackName] = (data: any) => {
      resolve(data);
      cleanup();
    };
    
    // Handle errors
    script.onerror = () => {
      reject(new Error('فشل JSONP'));
      cleanup();
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    // Set timeout for request
    const timeoutId = setTimeout(() => {
      if ((window as any)[callbackName]) {
        reject(new Error('انتهت مهلة JSONP'));
        cleanup();
      }
    }, timeout);
    
    // Cleanup function
    const cleanup = () => {
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      clearTimeout(timeoutId);
    };
  });
};
