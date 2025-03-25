
/**
 * عمليات المزامنة الأساسية مع Supabase
 * Core sync operations with Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { syncAllData } from '../../core/syncOperations';
import { handleError } from '@/utils/errorHandling';
import { toast } from '@/hooks/use-toast';
import { setSyncTimestamp } from '@/services/sync/status/timestamp';
import { checkSupabaseConnection } from '../connection/connectionCheck';
import { isRunningOnVercel } from '../../remote/fetch/skewProtection';
import { handleSupabaseError } from '../syncErrorHandler';
import { checkAndFixConnectionIssues } from '../connection/errorFixer';

/**
 * مزامنة البيانات مع Supabase
 * Synchronize data with Supabase
 * 
 * @param forceRefresh ما إذا كان يجب تجاهل التخزين المؤقت وإجبار التحديث
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح المزامنة
 */
export const performSupabaseSync = async (forceRefresh: boolean = false): Promise<boolean> => {
  try {
    // التحقق من الاتصال بـ Supabase أولاً
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      // محاولة إصلاح المشكلة
      console.log("محاولة إصلاح مشاكل الاتصال قبل المزامنة...");
      const isFixed = await checkAndFixConnectionIssues();
      
      if (!isFixed) {
        throw new Error('تعذر الاتصال بـ Supabase بعد محاولات الإصلاح');
      }
    }
    
    console.log("تم الاتصال بـ Supabase بنجاح، جاري تنفيذ المزامنة...");
    
    // إذا نجح الاتصال، قم بتنفيذ المزامنة الكاملة
    const syncResult = await syncAllData(forceRefresh);
    
    if (syncResult) {
      const syncTimestamp = new Date().toISOString();
      setSyncTimestamp(syncTimestamp);
      
      // عرض إشعار للمستخدم بنجاح المزامنة
      toast({
        title: "تم المزامنة بنجاح",
        description: "تم تحديث البيانات من Supabase",
        duration: 3000,
      });
      
      // على Vercel، تخزين معلومات المزامنة الإضافية
      if (isRunningOnVercel()) {
        try {
          localStorage.setItem('vercel_sync_success', 'true');
          localStorage.setItem('vercel_last_sync', syncTimestamp);
          localStorage.setItem('vercel_sync_count', 
            (parseInt(localStorage.getItem('vercel_sync_count') || '0') + 1).toString());
        } catch (e) {
          console.warn("تعذر تخزين معلومات المزامنة على Vercel:", e);
        }
      }
    }
    
    return syncResult;
  } catch (error) {
    // استخدام طريقة أكثر تفصيلاً لمعالجة الأخطاء
    const appError = handleError(error, 'مزامنة Supabase / Supabase sync');
    
    // محاولة معالجة خطأ Supabase
    const result = await handleSupabaseError(error, 'مزامنة Supabase');
    
    // إذا تم معالجة الخطأ بنجاح، حاول مرة أخرى
    if (result) {
      console.log("تم معالجة الخطأ بنجاح، جاري إعادة المحاولة...");
      
      // تأخير قصير قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // محاولة المزامنة مرة أخرى
      return await performSupabaseSync(forceRefresh);
    }
    
    // تسجيل تفاصيل الخطأ للتصحيح
    console.error("تفاصيل خطأ مزامنة Supabase:", {
      message: appError.message,
      type: appError.type,
      code: appError.code,
      retryable: appError.retryable,
      environment: isRunningOnVercel() ? 'Vercel' : 'غير Vercel'
    });
    
    throw error;
  }
};
