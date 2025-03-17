
/**
 * Utilities for fetching from local files
 */

/**
 * Fetch data from a local file
 * 
 * @param localPath Path to local file
 * @returns Promise resolving with the file content
 */
export const fetchLocalFile = async (localPath: string): Promise<any> => {
  try {
    console.log(`تحميل البيانات من ملف محلي: ${localPath}`);
    const response = await fetch(localPath, {
      method: 'GET',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`فشل في تحميل الملف المحلي: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`خطأ في تحميل الملف المحلي ${localPath}:`, error);
    throw error;
  }
};
