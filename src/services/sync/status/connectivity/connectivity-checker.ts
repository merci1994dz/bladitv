
/**
 * وظائف فحص حالة الاتصال
 * Functions for checking connectivity status
 */

import { isRemoteUrlAccessible } from '../../remote/fetch';
import { checkBladiInfoAvailability } from '../../remote/sync/sourceAvailability';

/**
 * فحص مشاكل الاتصال
 * Check connectivity issues
 */
export const checkConnectivityIssues = async (): Promise<{
  hasInternet: boolean;
  hasServerAccess: boolean;
  details?: string;
}> => {
  // التحقق من الاتصال بالإنترنت
  // Check for internet connection
  const hasInternet = navigator.onLine;
  
  if (!hasInternet) {
    return {
      hasInternet: false,
      hasServerAccess: false,
      details: 'No internet connection'
    };
  }
  
  try {
    // محاولة الوصول إلى مصادر البيانات
    // Try to access data sources
    const availableSource = await checkBladiInfoAvailability();
    
    if (availableSource) {
      return {
        hasInternet: true,
        hasServerAccess: true,
        details: `Available source: ${availableSource}`
      };
    }
    
    // محاولة الوصول إلى خدمات معروفة للتحقق من الاتصال
    // Try to access known services to verify connection
    const services = [
      'https://www.google.com',
      'https://www.cloudflare.com',
      'https://www.microsoft.com'
    ];
    
    let serviceAccessible = false;
    
    for (const service of services) {
      try {
        const canAccess = await isRemoteUrlAccessible(service);
        if (canAccess) {
          serviceAccessible = true;
          break;
        }
      } catch (err) {
        // Continue to next service
      }
    }
    
    return {
      hasInternet: true,
      hasServerAccess: serviceAccessible,
      details: serviceAccessible 
        ? 'Can access internet but not data sources' 
        : 'Internet connection appears limited'
    };
  } catch (error) {
    console.error('Error checking connectivity:', error);
    return {
      hasInternet: true,
      hasServerAccess: false,
      details: `Error during check: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
