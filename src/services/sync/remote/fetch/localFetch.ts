
/**
 * Load data from local files
 */

/**
 * Fetches data from a local file
 * 
 * @param filePath Path to local file
 * @returns Promise resolving with file content
 */
export const fetchLocalFile = async (filePath: string): Promise<any> => {
  // التأكد من أن المسار يبدأ بـ /
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  // إضافة معلمة لتجنب التخزين المؤقت
  const cacheParam = `_=${Date.now()}`;
  const urlWithCache = `${path}?${cacheParam}`;
  
  try {
    console.log(`جاري تحميل الملف المحلي: ${urlWithCache}`);
    
    const response = await fetch(urlWithCache, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`فشل في تحميل الملف المحلي: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (error) {
        throw new Error(`الملف المحلي ليس بتنسيق JSON صالح: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`خطأ في تحميل الملف المحلي ${path}:`, error);
    throw error;
  }
};
