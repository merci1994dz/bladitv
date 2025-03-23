
/**
 * معالجة أخطاء مزامنة Supabase
 * Supabase sync error handling
 */

import { toast } from '@/hooks/use-toast';
import { handleError, ErrorType } from '@/utils/errorHandling';
import { checkSupabaseConnection } from './connection/connectionCheck';

/**
 * أنواع أخطاء المزامنة مع Supabase
 * Supabase sync error types
 */
export enum SupabaseSyncErrorType {
  CONNECTION = 'CONNECTION',
  AUTHENTICATION = 'AUTHENTICATION',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  TIMEOUT = 'TIMEOUT',
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
  } else if (messageLC.includes('authentication') || messageLC.includes('mصادقة') || messageLC.includes('pgrst301')) {
    return SupabaseSyncErrorType.AUTHENTICATION;
  } else if (messageLC.includes('timeout') || messageLC.includes('مهلة') || messageLC.includes('تجاوز الوقت')) {
    return SupabaseSyncErrorType.TIMEOUT;
  } else if (messageLC.includes('connection') || messageLC.includes('اتصال') || messageLC.includes('connect')) {
    return SupabaseSyncErrorType.CONNECTION;
  } else {
    return SupabaseSyncErrorType.UNKNOWN;
  }
};

/**
 * معالجة أخطاء Supabase
 * Handle Supabase errors
 */
export const handleSupabaseError = async (error: unknown, context: string = 'Supabase sync'): Promise<boolean> => {
  const appError = handleError(error, context, false);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorType = classifySupabaseError(errorMessage);
  
  switch (errorType) {
    case SupabaseSyncErrorType.DUPLICATE_KEY:
      toast({
        title: "خطأ المفتاح المكرر",
        description: "يوجد تعارض في البيانات. جرب مسح ذاكرة التخزين المؤقت أو إعادة ضبط التطبيق.",
        variant: "destructive",
        duration: 5000,
      });
      return false;
      
    case SupabaseSyncErrorType.AUTHENTICATION:
      toast({
        title: "خطأ في المصادقة",
        description: "تعذر المصادقة مع Supabase. يرجى التحقق من تكوين المفاتيح.",
        variant: "destructive",
        duration: 5000,
      });
      return false;
      
    case SupabaseSyncErrorType.CONNECTION:
      // محاولة التحقق من الاتصال مرة أخرى
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast({
          title: "خطأ في الاتصال",
          description: "تعذر الاتصال بـ Supabase. تحقق من اتصالك بالإنترنت.",
          variant: "destructive",
          duration: 5000,
        });
      }
      return isConnected;
      
    case SupabaseSyncErrorType.TIMEOUT:
      toast({
        title: "انتهت مهلة الاتصال",
        description: "استغرقت العملية وقتًا طويلاً. سنحاول مرة أخرى لاحقًا.",
        variant: "destructive",
        duration: 4000,
      });
      return false;
      
    default:
      toast({
        title: "خطأ غير متوقع",
        description: appError.userMessage,
        variant: "destructive",
        duration: 5000,
      });
      return false;
  }
};
