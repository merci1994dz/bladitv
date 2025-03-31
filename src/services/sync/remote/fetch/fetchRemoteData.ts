
/**
 * وظيفة محسنة لجلب البيانات من مصادر خارجية
 * Optimized function for fetching data from external sources
 */

import { validateRemoteData } from '../../remoteValidation';

/**
 * جلب الملف المحلي
 * Fetch local file
 */
export const fetchLocalFile = async (localPath: string): Promise<any> => {
  try {
    const response = await fetch(localPath, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`فشل في جلب الملف المحلي ${localPath}:`, error);
    throw error;
  }
};

/**
 * جلب البيانات من مصدر خارجي
 * Fetch data from an external source
 */
export const fetchRemoteData = async (remoteUrl: string): Promise<any> => {
  // التعامل مع الملفات المحلية
  if (remoteUrl.startsWith('/')) {
    return fetchLocalFile(remoteUrl);
  }
  
  try {
    const response = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`فشل في جلب البيانات من ${remoteUrl}:`, error);
    throw error;
  }
};

/**
 * فحص ما إذا كان هناك مشكلة في الشبكة عند الاتصال بمصدر خارجي
 * Check if there's a network problem when connecting to an external source
 */
export const isRemoteUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    return true;
  } catch (error) {
    console.warn(`فشل فحص الوصول إلى ${url}:`, error);
    return false;
  }
};
