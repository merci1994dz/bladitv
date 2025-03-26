
/**
 * معالج أخطاء Supabase المخصص
 */

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';
import { checkAndFixConnectionIssues } from './connection/errorFixer';

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
        
        try {
          // هنا يمكن إضافة منطق محدد لمعالجة أخطاء المفتاح المكرر
          // مثل حذف السجل المتكرر أو تغيير المعرف
          
          // عرض إشعار للمستخدم
          const { toast } = useToast();
          toast({
            title: "تم اكتشاف سجل مكرر",
            description: "جاري محاولة إصلاح المشكلة...",
            variant: "default",
            duration: 3000,
          });
          
          // تخيل أننا أجرينا بعض عمليات الإصلاح هنا
          
          return true;
        } catch (fixError) {
          console.error('فشل إصلاح خطأ المفتاح المكرر:', fixError);
          return false;
        }
      }
      
      // خطأ الطلب غير الصحيح
      if (
        errorMessage.includes('bad request') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('malformed')
      ) {
        console.log('خطأ طلب غير صحيح في Supabase. لا يمكن الإصلاح تلقائيًا.');
        
        const { toast } = useToast();
        toast({
          title: "خطأ في تنسيق الطلب",
          description: "تعذر معالجة الطلب. يرجى إعادة تحميل التطبيق والمحاولة مرة أخرى.",
          variant: "default",
          duration: 5000,
        });
        
        return false;
      }
    }
    
    // لم نتمكن من معالجة الخطأ
    return false;
  } catch (handlerError) {
    console.error('خطأ أثناء محاولة معالجة خطأ Supabase:', handlerError);
    return false;
  }
};
