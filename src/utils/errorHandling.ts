
/**
 * معالجة أخطاء التطبيق
 * Application error handling
 */

import { STORAGE_KEYS } from '@/services/config';
import { useToast } from '@/hooks/use-toast';

/**
 * أنواع الأخطاء المدعومة
 * Supported error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * مستويات خطورة الأخطاء
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * تكوين لمعالجة الأخطاء
 * Configuration for error handling
 */
export const ErrorHandlingConfig = {
  MAX_ERRORS_STORED: 50,
  AUTO_CLEANUP_TIME: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  LOG_TO_CONSOLE: true,
  TOAST_ERRORS: true,
};

/**
 * تحديد نوع الخطأ وخصائصه
 * Determine error type and characteristics
 */
const determineErrorType = (error: Error | string): ErrorType => {
  const message = typeof error === 'string' ? error : error.message;
  const messageLC = message.toLowerCase();

  // تحديد نوع الخطأ
  if (
    messageLC.includes('network') ||
    messageLC.includes('offline') ||
    messageLC.includes('cors') ||
    messageLC.includes('connect') ||
    messageLC.includes('connectivity') ||
    messageLC.includes('connection')
  ) {
    return ErrorType.NETWORK;
  }

  if (
    messageLC.includes('auth') ||
    messageLC.includes('login') ||
    messageLC.includes('password') ||
    messageLC.includes('token') ||
    messageLC.includes('session') ||
    messageLC.includes('unauthorized') ||
    messageLC.includes('غير مصرح') ||
    messageLC.includes('permission') ||
    messageLC.includes('صلاحية')
  ) {
    return ErrorType.AUTH;
  }

  if (
    messageLC.includes('server') ||
    messageLC.includes('service') ||
    messageLC.includes('500') ||
    messageLC.includes('internal')
  ) {
    return ErrorType.SERVER;
  }

  if (
    messageLC.includes('database') ||
    messageLC.includes('sql') ||
    messageLC.includes('db') ||
    messageLC.includes('query') ||
    messageLC.includes('record') ||
    messageLC.includes('duplicate') ||
    messageLC.includes('data')
  ) {
    return ErrorType.DATABASE;
  }

  if (
    messageLC.includes('valid') ||
    messageLC.includes('format') ||
    messageLC.includes('input') ||
    messageLC.includes('require') ||
    messageLC.includes('missing') ||
    messageLC.includes('validation')
  ) {
    return ErrorType.VALIDATION;
  }

  if (
    messageLC.includes('not found') ||
    messageLC.includes('404') ||
    messageLC.includes('غير موجود') ||
    messageLC.includes('no record')
  ) {
    return ErrorType.NOT_FOUND;
  }

  if (
    messageLC.includes('timeout') ||
    messageLC.includes('timed out') ||
    messageLC.includes('مهلة') ||
    messageLC.includes('too long')
  ) {
    return ErrorType.TIMEOUT;
  }

  if (
    messageLC.includes('rate limit') ||
    messageLC.includes('too many') ||
    messageLC.includes('exceeded')
  ) {
    return ErrorType.RATE_LIMIT;
  }

  return ErrorType.UNKNOWN;
};

/**
 * تحديد مستوى خطورة الخطأ
 * Determine error severity level
 */
const determineErrorSeverity = (type: ErrorType): ErrorSeverity => {
  switch (type) {
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
      return ErrorSeverity.WARNING;
    case ErrorType.NOT_FOUND:
    case ErrorType.VALIDATION:
    case ErrorType.RATE_LIMIT:
      return ErrorSeverity.INFO;
    case ErrorType.AUTH:
    case ErrorType.DATABASE:
      return ErrorSeverity.ERROR;
    case ErrorType.SERVER:
      return ErrorSeverity.CRITICAL;
    default:
      return ErrorSeverity.WARNING;
  }
};

/**
 * تحديد ما إذا كان من الممكن إعادة المحاولة
 * Determine if retry is possible
 */
const determineIfRetryable = (type: ErrorType): boolean => {
  switch (type) {
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
    case ErrorType.SERVER:
    case ErrorType.RATE_LIMIT:
      return true;
    default:
      return false;
  }
};

/**
 * إستخراج رمز الخطأ وتنسيقه
 * Extract error code if available
 */
const extractErrorCode = (error: Error | string): string | null => {
  if (typeof error === 'string') {
    return null;
  }

  // محاولة العثور على كود الخطأ في الرسالة
  const codeMatch = error.message.match(/(\d{3,4})/);
  if (codeMatch && codeMatch[0]) {
    return codeMatch[0];
  }

  // البحث عن رمز خطأ واضح
  const anyError = error as any;
  if (anyError.code) {
    return anyError.code.toString();
  }

  if (anyError.status) {
    return anyError.status.toString();
  }

  return null;
};

/**
 * اشتقاق رسالة خطأ ملائمة للمستخدم
 * Derive a user-friendly error message
 */
const deriveUserFriendlyMessage = (
  error: Error | string,
  type: ErrorType,
  severity: ErrorSeverity
): string => {
  const originalMessage = typeof error === 'string' ? error : error.message;

  // رسائل مخصصة للأخطاء الشائعة
  switch (type) {
    case ErrorType.NETWORK:
      return 'حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.';
    case ErrorType.AUTH:
      return 'حدث خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.';
    case ErrorType.NOT_FOUND:
      return 'لم يتم العثور على المورد المطلوب.';
    case ErrorType.TIMEOUT:
      return 'استغرقت العملية وقتًا طويلاً. يرجى المحاولة مرة أخرى.';
    case ErrorType.VALIDATION:
      return 'البيانات المدخلة غير صالحة. يرجى مراجعة المدخلات وإعادة المحاولة.';
    case ErrorType.SERVER:
      return 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.';
    case ErrorType.DATABASE:
      return 'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى لاحقًا.';
    case ErrorType.RATE_LIMIT:
      return 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة مرة أخرى بعد قليل.';
    default:
      // إرجاع الرسالة الأصلية إذا كانت قصيرة ومفهومة
      if (originalMessage.length < 100 && !originalMessage.includes('Error:')) {
        return originalMessage;
      }
      return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.';
  }
};

/**
 * تخزين الخطأ في سجل الأخطاء المحلي
 * Store error in local error log
 */
const storeErrorInLog = (appError: AppError): void => {
  try {
    // جلب السجل الحالي
    const errorLogJSON = localStorage.getItem(STORAGE_KEYS.SYNC_ERROR);
    const errorLog = errorLogJSON ? JSON.parse(errorLogJSON) : [];

    // إضافة الخطأ الجديد
    errorLog.unshift({
      ...appError,
      timestamp: new Date().toISOString(),
    });

    // تقليص السجل إذا كان طويلاً جدًا
    const trimmedLog = errorLog.slice(0, ErrorHandlingConfig.MAX_ERRORS_STORED);

    // تخزين السجل المحدث
    localStorage.setItem(STORAGE_KEYS.SYNC_ERROR, JSON.stringify(trimmedLog));
  } catch (e) {
    // تجاهل أخطاء التخزين المحلي
    console.error('فشل في تخزين الخطأ في السجل المحلي:', e);
  }
};

/**
 * عرض إشعار للمستخدم بالخطأ
 * Show error notification to user
 */
const showErrorToast = (appError: AppError): void => {
  if (!ErrorHandlingConfig.TOAST_ERRORS) {
    return;
  }

  try {
    const { toast } = useToast();
    
    // تحديد مدة عرض الإشعار بناءً على خطورة الخطأ
    let duration = 5000; // 5 ثوانٍ افتراضية
    if (appError.severity === ErrorSeverity.CRITICAL) {
      duration = 10000; // 10 ثوانٍ للأخطاء الحرجة
    } else if (appError.severity === ErrorSeverity.INFO) {
      duration = 3000; // 3 ثوانٍ للمعلومات
    }

    // عرض الإشعار
    toast({
      title: `خطأ: ${appError.context || 'في التطبيق'}`,
      description: appError.userMessage,
      variant: "destructive",
      duration: duration
    });
  } catch (e) {
    // تجاهل أخطاء عرض الإشعار
    console.error('فشل في عرض إشعار الخطأ:', e);
  }
};

/**
 * تسجيل الخطأ في وحدة التحكم
 * Log error to console
 */
const logErrorToConsole = (appError: AppError, originalError?: Error | string): void => {
  if (!ErrorHandlingConfig.LOG_TO_CONSOLE) {
    return;
  }

  const { type, severity, message, context, code, retryable, userMessage } = appError;

  console.group(
    `%cApplication Error: ${context ? context : 'Uncategorized'}`,
    'color: #721c24; background-color: #f8d7da; padding: 2px 5px; border-radius: 3px;'
  );
  console.error('Type:', type);
  console.error('Severity:', severity);
  console.error('Message:', message);
  console.error('User Message:', userMessage);
  if (code) console.error('Code:', code);
  console.error('Retryable:', retryable);
  console.error('Time:', new Date().toISOString());
  if (originalError && typeof originalError !== 'string') {
    console.error('Original Error:', originalError);
    console.error('Stack:', originalError.stack);
  }
  console.groupEnd();
};

/**
 * واجهة كائن الخطأ المعالج
 * Processed error object interface
 */
export interface AppError {
  message: string;
  userMessage: string;
  type: ErrorType;
  severity: ErrorSeverity;
  code: string | null;
  retryable: boolean;
  context?: string;
}

/**
 * معالجة الخطأ وتحويله إلى كائن AppError
 * Process error and convert to AppError object
 */
export function handleError(
  error: unknown,
  context?: string,
  showToast: boolean = true
): AppError {
  // تحويل الخطأ إلى Error أو string
  let normalizedError: Error | string;
  if (error instanceof Error) {
    normalizedError = error;
  } else if (typeof error === 'string') {
    normalizedError = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    normalizedError = new Error(String(error.message));
  } else {
    normalizedError = new Error('Unknown error occurred');
  }

  // تحديد خصائص الخطأ
  const type = determineErrorType(normalizedError);
  const severity = determineErrorSeverity(type);
  const retryable = determineIfRetryable(type);
  const code = extractErrorCode(normalizedError);
  const message = typeof normalizedError === 'string' ? normalizedError : normalizedError.message;
  const userMessage = deriveUserFriendlyMessage(normalizedError, type, severity);

  // إنشاء كائن الخطأ
  const appError: AppError = {
    message,
    userMessage,
    type,
    severity,
    code,
    retryable,
    context,
  };

  // تسجيل الخطأ وتخزينه
  logErrorToConsole(appError, normalizedError);
  storeErrorInLog(appError);

  // عرض إشعار للمستخدم إذا تم طلب ذلك
  if (showToast) {
    try {
      const { toast } = useToast();
      
      toast({
        title: `خطأ: ${context || 'خطأ في التطبيق'}`,
        description: userMessage,
        variant: "destructive",
        duration: 5000
      });
    } catch (e) {
      console.error('تعذر عرض إشعار الخطأ:', e);
    }
  }

  return appError;
}

/**
 * استرجاع سجل الأخطاء
 * Retrieve error log
 */
export function getErrorLog(): Array<AppError & { timestamp: string }> {
  try {
    const errorLogJSON = localStorage.getItem(STORAGE_KEYS.SYNC_ERROR);
    return errorLogJSON ? JSON.parse(errorLogJSON) : [];
  } catch (e) {
    console.error('فشل في استرجاع سجل الأخطاء:', e);
    return [];
  }
}

/**
 * مسح سجل الأخطاء
 * Clear error log
 */
export function clearErrorLog(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.SYNC_ERROR);
    return true;
  } catch (e) {
    console.error('فشل في مسح سجل الأخطاء:', e);
    return false;
  }
}

/**
 * التنظيف التلقائي لسجل الأخطاء القديمة
 * Auto-cleanup of old error logs
 */
export function setupErrorLogCleanup(): void {
  // تشغيل التنظيف عند بدء التطبيق
  cleanupOldErrors();

  // إعداد تنظيف دوري
  setInterval(cleanupOldErrors, 24 * 60 * 60 * 1000); // مرة واحدة يوميًا
}

/**
 * تنظيف الأخطاء القديمة
 * Cleanup old errors
 */
function cleanupOldErrors(): void {
  try {
    const errorLogJSON = localStorage.getItem(STORAGE_KEYS.SYNC_ERROR);
    if (!errorLogJSON) return;

    const errorLog = JSON.parse(errorLogJSON);
    const now = Date.now();
    const cutoff = now - ErrorHandlingConfig.AUTO_CLEANUP_TIME;

    // الاحتفاظ فقط بالأخطاء الحديثة
    const recentErrors = errorLog.filter((error: any) => {
      const errorTime = new Date(error.timestamp).getTime();
      return errorTime > cutoff;
    });

    // تحديث السجل فقط إذا تم إزالة أي أخطاء
    if (recentErrors.length < errorLog.length) {
      localStorage.setItem(STORAGE_KEYS.SYNC_ERROR, JSON.stringify(recentErrors));
    }
  } catch (e) {
    console.error('فشل في تنظيف سجل الأخطاء القديمة:', e);
  }
}
