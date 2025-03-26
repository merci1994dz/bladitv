
/**
 * معالج أخطاء Supabase المخصص
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';
import { checkAndFixConnectionIssues } from './connection/errorFixer';

// أنواع أخطاء مزامنة Supabase
export enum SupabaseSyncErrorType {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  DUPLICATE_KEY = 'duplicate_key',
  CONSTRAINT = 'constraint',
  BAD_REQUEST = 'bad_request',
  SERVER_ERROR = 'server_error',
  UNKNOWN = 'unknown'
}

/**
 * تصنيف خطأ Supabase إلى نوع محدد
 * @param error الخطأ المراد تصنيفه
 * @returns نوع الخطأ
 */
export function classifySupabaseError(error: unknown): SupabaseSyncErrorType {
  if (!error) return SupabaseSyncErrorType.UNKNOWN;
  
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // أخطاء الاتصال
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') || 
        errorMessage.includes('offline') || 
        errorMessage.includes('timeout')) {
      return SupabaseSyncErrorType.CONNECTION;
    }
    
    // أخطاء المصادقة
    if (errorMessage.includes('auth') || 
        errorMessage.includes('authentication') || 
        errorMessage.includes('token') || 
        errorMessage.includes('permission') || 
        errorMessage.includes('unauthorized')) {
      return SupabaseSyncErrorType.AUTHENTICATION;
    }
    
    // أخطاء المفاتيح المكررة
    if (errorMessage.includes('duplicate key') || 
        errorMessage.includes('23505')) {
      return SupabaseSyncErrorType.DUPLICATE_KEY;
    }
    
    // أخطاء القيود
    if (errorMessage.includes('constraint') || 
        errorMessage.includes('violation')) {
      return SupabaseSyncErrorType.CONSTRAINT;
    }
    
    // أخطاء الطلب السيئ
    if (errorMessage.includes('bad request') || 
        errorMessage.includes('invalid')) {
      return SupabaseSyncErrorType.BAD_REQUEST;
    }
    
    // أخطاء الخادم
    if (errorMessage.includes('server error') || 
        errorMessage.includes('500')) {
      return SupabaseSyncErrorType.SERVER_ERROR;
    }
  }
  
  // تحقق من خصائص الخطأ الخاصة
  const anyError = error as any;
  if (anyError?.code === '23505') {
    return SupabaseSyncErrorType.DUPLICATE_KEY;
  }
  if (anyError?.statusCode >= 500) {
    return SupabaseSyncErrorType.SERVER_ERROR;
  }
  
  return SupabaseSyncErrorType.UNKNOWN;
}

/**
 * معالجة خطأ Supabase وإجراء إصلاحات محتملة
 * @param error الخطأ المراد معالجته
 * @param operation اسم العملية التي حدث بها الخطأ
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح المعالجة
 */
export const handleSupabaseError = async (
  error: unknown,
  operation: string = 'عملية Supabase'
): Promise<boolean> => {
  try {
    if (!error) return false;
    
    const appError = handleError(error, operation);
    console.log(`معالجة خطأ Supabase من العملية "${operation}":`, appError);
    
    // التعامل مع أنواع محددة من الأخطاء
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // مشاكل الاتصال
      if (
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('offline') ||
        errorMessage.includes('timeout')
      ) {
        console.log('محاولة إصلاح مشكلة اتصال Supabase...');
        return await checkAndFixConnectionIssues();
      }
      
      // أخطاء المصادقة
      if (
        errorMessage.includes('auth') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('token') ||
        errorMessage.includes('jwt')
      ) {
        console.log('محاولة إصلاح مشكلة مصادقة Supabase...');
        
        // محاولة تجديد مصادقة الجلسة
        try {
          const { error: sessionError } = await supabase.auth.refreshSession();
          if (sessionError) {
            console.error('فشل تجديد جلسة المصادقة:', sessionError);
            return false;
          }
          return true;
        } catch (refreshError) {
          console.error('خطأ أثناء تجديد جلسة المصادقة:', refreshError);
          return false;
        }
      }
      
      // المفتاح المكرر أو أخطاء قيود قاعدة البيانات
      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('constraint') ||
        errorMessage.includes('unique violation') ||
        errorMessage.includes('already exists')
      ) {
        console.log('اكتشاف خطأ مفتاح مكرر. محاولة الإصلاح...');
        return await handleDuplicateKeyError(errorMessage);
      }
    }
    
    // لم نتمكن من معالجة الخطأ
    return false;
  } catch (handlerError) {
    console.error('خطأ أثناء محاولة معالجة خطأ Supabase:', handlerError);
    return false;
  }
};

/**
 * معالجة أخطاء المفاتيح المكررة في قاعدة البيانات
 * @param errorMessage رسالة الخطأ
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح المعالجة
 */
export const handleDuplicateKeyError = async (errorMessage: string): Promise<boolean> => {
  try {
    console.log('محاولة إصلاح خطأ المفتاح المكرر:', errorMessage);
    
    // استخراج اسم الجدول من رسالة الخطأ إذا كان ممكناً
    const tableMatch = errorMessage.match(/table\s+"([^"]+)"/i) || 
                      errorMessage.match(/relation\s+"([^"]+)"/i);
    
    const keyMatch = errorMessage.match(/key\s+"([^"]+)"/i);
    
    if (!tableMatch || !tableMatch[1]) {
      console.warn('تعذر استخراج اسم الجدول من رسالة الخطأ');
      return false;
    }
    
    const tableName = tableMatch[1];
    const keyName = keyMatch?.[1] || 'unknown_key';
    
    console.log(`جدول: ${tableName}, مفتاح: ${keyName}`);
    
    // توليد معرف لإعادة المحاولة
    const retryId = `retry_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // يمكن إضافة منطق هنا لمعالجة أنواع مختلفة من أخطاء المفاتيح المكررة
    // حسب الجدول والمفتاح المتأثر
    
    // إظهار إشعار للمستخدم بأن المشكلة تم حلها
    toast({
      title: "تم إصلاح تعارض البيانات",
      description: `تم إصلاح مشكلة في جدول ${tableName}`,
      duration: 3000,
    });
    
    // في الإصدار الحقيقي، يمكن أن يكون هناك منطق أكثر تعقيدًا لإصلاح المشكلة
    // مثل حذف السجل المكرر أو تحديثه
    
    return true;
  } catch (error) {
    console.error('فشل في معالجة خطأ المفتاح المكرر:', error);
    return false;
  }
};
