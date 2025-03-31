
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncWithSupabase } from '@/services/sync/supabaseSync';
import { forceDataRefresh } from '@/services/sync/index';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/sourceAvailability';
import { useToast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';

interface SyncCallbacks {
  onSyncStart?: () => void;
  onSyncEnd?: () => void;
}

export const useSyncMutations = (refetchLastSync: () => void, callbacks?: SyncCallbacks) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isVercel = isRunningOnVercel();
  
  // تشغيل المزامنة مع Supabase مع تحسين معالجة الأخطاء
  const { mutate: runSync, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      // تشغيل وظيفة بدء المزامنة
      callbacks?.onSyncStart?.();
      
      // استخدام آلية إعادة المحاولة المحسّنة
      let attemptCount = 0;
      const maxAttempts = isVercel ? 4 : 2; // زيادة عدد المحاولات على Vercel
      
      while (attemptCount < maxAttempts) {
        try {
          // إضافة تأخير متدرج بين المحاولات
          if (attemptCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attemptCount));
          }
          
          const result = await syncWithSupabase(true);
          return result;
        } catch (error) {
          attemptCount++;
          console.warn(`محاولة المزامنة ${attemptCount} فشلت:`, error);
          
          // إذا كانت هذه آخر محاولة، ارمِ الخطأ
          if (attemptCount >= maxAttempts) {
            throw error;
          }
        }
      }
      
      throw new Error("فشلت جميع محاولات المزامنة");
    },
    onMutate: () => {
      // إظهار رسالة جاري المعالجة للمستخدم
      toast({
        title: "جاري المزامنة",
        description: "جاري تحديث البيانات من Supabase...",
      });
    },
    onSuccess: () => {
      // إبطال التخزين المؤقت لجميع البيانات ذات الصلة
      queryClient.invalidateQueries({ queryKey: ['lastSync'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      refetchLastSync();
      
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث البيانات بنجاح من Supabase",
      });
      
      // على Vercel، قم بتحديث بيانات النشر
      if (isVercel) {
        try {
          localStorage.setItem('last_vercel_sync', new Date().toISOString());
          localStorage.setItem('vercel_sync_count', 
            String(Number(localStorage.getItem('vercel_sync_count') || '0') + 1)
          );
        } catch (e) {
          console.warn('تعذر تحديث معلومات المزامنة على Vercel:', e);
        }
      }
      
      // تشغيل وظيفة انتهاء المزامنة
      callbacks?.onSyncEnd?.();
    },
    onError: (error) => {
      console.error('خطأ في المزامنة:', error);
      
      // استخدام معالج الأخطاء المحسن
      handleError(error, 'المزامنة مع Supabase');
      
      // إعادة المحاولة تلقائيًا بعد تأخير إذا كان الخطأ متعلقًا بالشبكة
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        (errorMessage.includes('network') || 
         errorMessage.includes('connection') || 
         errorMessage.includes('timeout') || 
         errorMessage.includes('fetch')) && 
        navigator.onLine
      ) {
        toast({
          title: "إعادة محاولة المزامنة",
          description: "جاري إعادة محاولة المزامنة بعد فشل الاتصال...",
        });
        
        // زيادة التأخير على Vercel
        const retryDelay = isVercel ? 7000 : 5000;
        
        setTimeout(() => {
          console.log('إعادة محاولة المزامنة بعد فشل الشبكة...');
          runSync();
        }, retryDelay);
      }
      
      // تشغيل وظيفة انتهاء المزامنة
      callbacks?.onSyncEnd?.();
    },
    onSettled: () => {
      // تشغيل وظيفة انتهاء المزامنة (للتأكد من تنفيذها في جميع الحالات)
      callbacks?.onSyncEnd?.();
    },
  });

  // تشغيل المزامنة القسرية (للمشرفين فقط) مع تحسينات في معالجة الأخطاء
  const { mutate: runForceSync, isPending: isForceSyncing } = useMutation({
    mutationFn: async () => {
      callbacks?.onSyncStart?.();
      
      try {
        // تحسين أداء التحديث القسري
        const cacheCleared = await forceDataRefresh();
        
        // جلب البيانات مباشرة بعد مسح ذاكرة التخزين المؤقت
        if (cacheCleared) {
          await syncWithSupabase(true);
        }

        // على Vercel، قم بتسجيل التحديث القسري
        if (isVercel) {
          try {
            localStorage.setItem('last_vercel_force_sync', new Date().toISOString());
          } catch (e) {
            // تجاهل الأخطاء
          }
        }
        
        return cacheCleared;
      } catch (error) {
        console.error('خطأ أثناء التحديث القسري:', error);
        throw error;
      }
    },
    onMutate: () => {
      toast({
        title: "جاري التحديث القسري",
        description: "جاري مسح ذاكرة التخزين المؤقت وإعادة تحميل البيانات...",
      });
    },
    onSuccess: () => {
      // إبطال التخزين المؤقت لجميع الاستعلامات
      queryClient.invalidateQueries();
      
      toast({
        title: "تم إعادة التحميل القسري",
        description: "تم مسح ذاكرة التخزين المؤقت وإعادة تحميل البيانات بنجاح",
      });
      
      callbacks?.onSyncEnd?.();
    },
    onError: (error) => {
      console.error('خطأ في التحديث القسري:', error);
      
      // استخدام معالج الأخطاء المحسن
      handleError(error, 'التحديث القسري');
      
      callbacks?.onSyncEnd?.();
    },
    onSettled: () => {
      callbacks?.onSyncEnd?.();
    },
  });
  
  return {
    runSync,
    isSyncing,
    runForceSync,
    isForceSyncing,
    checkAvailableSource: checkBladiInfoAvailability,
    isVercelDeployment: isVercel
  };
};
