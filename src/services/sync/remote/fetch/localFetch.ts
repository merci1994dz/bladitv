
/**
 * وظائف جلب البيانات من الملفات المحلية
 * Functions for fetching data from local files
 */

/**
 * جلب بيانات من ملف محلي
 * Fetch data from a local file
 */
export const fetchLocalFile = async (localPath: string): Promise<any> => {
  console.log(`جلب بيانات من ملف محلي: ${localPath}`);
  
  // إضافة معلمات لمنع التخزين المؤقت
  const cacheBuster = `?_=${Date.now()}`;
  const pathWithCache = `${localPath}${cacheBuster}`;
  
  try {
    const response = await fetch(pathWithCache);
    
    if (!response.ok) {
      throw new Error(`فشل في جلب الملف المحلي: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      throw new Error('نوع المحتوى غير مدعوم، يجب أن يكون JSON');
    }
  } catch (error) {
    console.error(`خطأ في جلب الملف المحلي ${localPath}:`, error);
    throw new Error(`فشل في جلب الملف المحلي: ${error instanceof Error ? error.message : String(error)}`);
  }
};
