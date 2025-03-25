
/**
 * معالجة أخطاء مزامنة Supabase
 * Supabase sync error handling
 */

import { toast } from '@/hooks/use-toast';
import { handleError, ErrorType } from '@/utils/errorHandling';
import { checkSupabaseConnection } from './connection/connectionCheck';
import { clearDuplicateKeyErrors } from './connection/errorFixer';

/**
 * أنواع أخطاء المزامنة مع Supabase
 * Supabase sync error types
 */
export enum SupabaseSyncErrorType {
  CONNECTION = 'CONNECTION',
  AUTHENTICATION = 'AUTHENTICATION',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  TIMEOUT = 'TIMEOUT',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

/**
 * تصنيف خطأ Supabase
 * Classify Supabase error
 */
export const classifySupabaseError = (error: Error | string): SupabaseSyncErrorType => {
  const message = typeof error === 'string' ? error : error.message;
  const messageLC = message.toLowerCase();
  
  if (messageLC.includes('duplicate key') || messageLC.includes('23505')) {
    return SupabaseSyncErrorType.DUPLICATE_KEY;
  } else if (messageLC.includes('authentication') || messageLC.includes('مصادقة') || messageLC.includes('pgrst301')) {
    return SupabaseSyncErrorType.AUTHENTICATION;
  } else if (messageLC.includes('timeout') || messageLC.includes('مهلة') || messageLC.includes('تجاوز الوقت')) {
    return SupabaseSyncErrorType.TIMEOUT;
  } else if (messageLC.includes('connection') || messageLC.includes('اتصال') || messageLC.includes('connect')) {
    return SupabaseSyncErrorType.CONNECTION;
  } else if (messageLC.includes('constraint') || messageLC.includes('violation') || 
             messageLC.includes('قيود') || messageLC.includes('مخالفة')) {
    return SupabaseSyncErrorType.CONSTRAINT_VIOLATION;
  } else if (messageLC.includes('network') || messageLC.includes('شبكة') || 
             messageLC.includes('fetch failed') || messageLC.includes('cors')) {
    return SupabaseSyncErrorType.NETWORK;
  } else {
    return SupabaseSyncErrorType.UNKNOWN;
  }
};

/**
 * الحصول على رسالة خطأ معروضة للمستخدم
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (errorType: SupabaseSyncErrorType, error: any): string => {
  switch (errorType) {
    case SupabaseSyncErrorType.DUPLICATE_KEY:
      return "يوجد تعارض في المفاتيح. جاري محاولة إصلاح المشكلة تلقائياً...";
    case SupabaseSyncErrorType.AUTHENTICATION:
      return "خطأ في المصادقة مع قاعدة البيانات. يرجى التحقق من صلاحيات الوصول.";
    case SupabaseSyncErrorType.TIMEOUT:
      return "انتهت مهلة الاتصال بقاعدة البيانات. قد تكون الشبكة بطيئة أو غير مستقرة.";
    case SupabaseSyncErrorType.CONNECTION:
      return "تعذر الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت.";
    case SupabaseSyncErrorType.CONSTRAINT_VIOLATION:
      return "حدث خطأ عند حفظ البيانات. يوجد تعارض مع قيود قاعدة البيانات.";
    case SupabaseSyncErrorType.NETWORK:
      return "مشكلة في شبكة الاتصال. تعذر الوصول إلى الخادم.";
    default:
      if (error instanceof Error) {
        console.error("خطأ غير معروف:", error);
        return `خطأ غير متوقع: ${error.message.slice(0, 100)}`;
      }
      return "حدث خطأ غير متوقع أثناء الاتصال بقاعدة البيانات.";
  }
};

/**
 * معالجة أخطاء Supabase مع محاولات الإصلاح التلقائي
 * Handle Supabase errors with auto-repair attempts
 */
export const handleSupabaseError = async (error: unknown, context: string = 'Supabase sync'): Promise<boolean> => {
  const appError = handleError(error, context, false);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorType = classifySupabaseError(errorMessage);
  
  console.log(`[SupabaseError] نوع الخطأ: ${errorType}, السياق: ${context}`);
  console.error(`[SupabaseError] رسالة الخطأ: ${errorMessage}`);
  
  const userMessage = getUserFriendlyErrorMessage(errorType, error);
  
  let toastVariant = "destructive";
  let toastDuration = 5000;
  let fixAttempted = false;
  
  switch (errorType) {
    case SupabaseSyncErrorType.DUPLICATE_KEY:
      fixAttempted = await handleDuplicateKeyError(error);
      if (fixAttempted) {
        toast({
          title: "محاولة إصلاح خطأ المفتاح المكرر",
          description: "جاري معالجة تعارض المفاتيح. قد تحتاج لإعادة المزامنة يدوياً.",
          duration: 8000,
        });
        return true;
      }
      break;
      
    case SupabaseSyncErrorType.AUTHENTICATION:
      toast({
        title: "خطأ في المصادقة",
        description: userMessage,
        variant: toastVariant,
        duration: toastDuration,
      });
      return false;
      
    case SupabaseSyncErrorType.CONNECTION:
      // محاولة التحقق من الاتصال مرة أخرى
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast({
          title: "خطأ في الاتصال",
          description: userMessage,
          variant: toastVariant,
          duration: toastDuration,
        });
      }
      return isConnected;
      
    case SupabaseSyncErrorType.TIMEOUT:
      toast({
        title: "انتهت مهلة الاتصال",
        description: userMessage,
        variant: "default",
        duration: 4000,
      });
      return false;
      
    default:
      toast({
        title: "خطأ في المزامنة",
        description: userMessage,
        variant: toastVariant,
        duration: toastDuration,
      });
      return false;
  }
  
  // إذا لم يتم اتخاذ إجراء محدد، عرض إشعار عام
  if (!fixAttempted) {
    toast({
      title: "خطأ في المزامنة",
      description: userMessage,
      variant: toastVariant,
      duration: toastDuration,
    });
  }
  
  return false;
};

/**
 * معالجة خطأ المفتاح المكرر مع محاولة الإصلاح التلقائي
 * Handle duplicate key error with auto-repair attempt
 */
export const handleDuplicateKeyError = async (error: unknown): Promise<boolean> => {
  console.log("[DuplicateKeyError] جاري محاولة إصلاح خطأ المفتاح المكرر");
  
  try {
    // تحليل رسالة الخطأ لتحديد الجدول
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // البحث عن اسم الجدول في رسالة الخطأ
    let tableName = null;
    const tableMatch = errorMessage.match(/table "([^"]+)"/);
    if (tableMatch && tableMatch[1]) {
      tableName = tableMatch[1];
    }
    
    console.log(`[DuplicateKeyError] الجدول المستهدف: ${tableName || 'غير معروف'}`);
    
    // محاولة إصلاح المفتاح المكرر
    const isFixed = await clearDuplicateKeyErrors(tableName);
    
    return isFixed;
  } catch (fixError) {
    console.error("[DuplicateKeyError] فشل في إصلاح خطأ المفتاح المكرر:", fixError);
    return false;
  }
};
