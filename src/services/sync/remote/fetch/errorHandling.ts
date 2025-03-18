
/**
 * معالجة أخطاء جلب البيانات من المصادر الخارجية
 * Error handling for fetching data from remote sources
 */

/**
 * تحسين رسالة الخطأ بمعلومات مفيدة للتصحيح
 * Enhance error message with useful debugging information
 */
export const enhanceFetchError = (
  error: Error,
  url: string,
  previousErrors: Error[] = []
): Error => {
  // إنشاء رسالة خطأ مفصلة
  const errorMessage = `خطأ في جلب البيانات: ${error.message}`;
  
  // إنشاء خطأ جديد بالرسالة المحسنة
  const enhancedError = new Error(errorMessage);
  
  // إضافة البيانات الوصفية التي قد تكون مفيدة للتصحيح
  Object.defineProperty(enhancedError, 'url', {
    value: url,
    enumerable: true
  });
  
  Object.defineProperty(enhancedError, 'previousErrors', {
    value: previousErrors,
    enumerable: true
  });
  
  Object.defineProperty(enhancedError, 'timestamp', {
    value: new Date().toISOString(),
    enumerable: true
  });
  
  Object.defineProperty(enhancedError, 'hasInternet', {
    value: navigator.onLine,
    enumerable: true
  });
  
  // الاحتفاظ بتتبع المكدس الأصلي إذا كان متاحًا
  if (error.stack) {
    enhancedError.stack = error.stack;
  }
  
  return enhancedError;
};

/**
 * التحقق مما إذا كان الخطأ متعلقًا بشبكة الاتصال
 * Check if the error is related to connectivity
 */
export const isConnectivityError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  
  // التعرف على أنماط أخطاء الاتصال الشائعة
  const connectivityErrorPatterns = [
    'network error',
    'failed to fetch',
    'aborted',
    'timeout',
    'cors',
    'connection refused',
    'network request failed'
  ];
  
  return connectivityErrorPatterns.some(pattern => message.includes(pattern));
};

/**
 * تحويل خطأ الجلب إلى شكل قابل للقراءة البشرية
 * Convert fetch error to human-readable form
 */
export const getUserFriendlyErrorMessage = (error: Error): string => {
  if (isConnectivityError(error)) {
    if (!navigator.onLine) {
      return 'أنت غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
    }
    
    return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
  }
  
  // أخطاء CORS شائعة جدًا - تقديم رسالة مفيدة
  if (error.message.toLowerCase().includes('cors')) {
    return 'تعذر الوصول إلى البيانات بسبب قيود أمنية. جاري محاولة استخدام طرق بديلة...';
  }
  
  // رسالة عامة للأخطاء الأخرى
  return 'حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى لاحقًا.';
};
