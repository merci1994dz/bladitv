
import { useEffect, useState, useCallback } from 'react';
import { syncWithSupabase, setupRealtimeSync, initializeSupabaseTables } from '@/services/sync/supabaseSync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status';

export const useAutoSync = () => {
  const { toast } = useToast();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<{
    hasInternet: boolean;
    hasServerAccess: boolean;
  }>({ hasInternet: navigator.onLine, hasServerAccess: false });
  
  // إعادة تعيين حالة الخطأ
  const resetSyncError = useCallback(() => {
    setSyncError(null);
  }, []);
  
  // التحقق من حالة الشبكة
  const checkNetworkStatus = useCallback(async () => {
    try {
      console.log('التحقق من حالة الشبكة والوصول إلى الخادم...');
      const status = await checkConnectivityIssues();
      console.log('نتائج فحص الشبكة:', status);
      setNetworkStatus(status);
      return status;
    } catch (error) {
      console.error('خطأ في فحص حالة الشبكة:', error);
      setNetworkStatus({ hasInternet: navigator.onLine, hasServerAccess: false });
      return { hasInternet: navigator.onLine, hasServerAccess: false };
    }
  }, []);
  
  // التحقق من مصادر البيانات المتاحة
  const checkSourceAvailability = useCallback(async () => {
    try {
      // التحقق من حالة الشبكة أولاً
      const { hasInternet, hasServerAccess } = await checkNetworkStatus();
      
      if (!hasInternet || !hasServerAccess) {
        console.warn('تعذر الوصول إلى المصادر الخارجية بسبب مشاكل في الاتصال');
        setSyncError('تعذر الوصول إلى المصادر الخارجية بسبب مشاكل في الاتصال');
        return null;
      }
      
      const availableUrl = await checkBladiInfoAvailability();
      setAvailableSource(availableUrl);
      
      if (availableUrl) {
        console.log(`وجدنا مصدر بيانات متاح: ${availableUrl}`);
        resetSyncError();
      } else {
        console.warn('لم نتمكن من العثور على أي مصدر بيانات متاح');
        setSyncError('لم نتمكن من العثور على أي مصدر بيانات متاح');
        
        toast({
          title: "تنبيه",
          description: "لم نتمكن من العثور على أي مصدر بيانات متاح",
          variant: "destructive",
          duration: 5000,
        });
      }
      
      return availableUrl;
    } catch (error) {
      console.error('خطأ في التحقق من توفر المصادر:', error);
      setSyncError(`خطأ في التحقق من توفر المصادر: ${String(error)}`);
      return null;
    }
  }, [checkNetworkStatus, resetSyncError, toast]);
  
  // تهيئة جداول Supabase
  const initializeSupabase = useCallback(async () => {
    try {
      setIsSyncing(true);
      console.log('محاولة تهيئة جداول Supabase...');
      
      const initialized = await initializeSupabaseTables();
      
      if (!initialized) {
        console.warn('فشل في تهيئة Supabase، قد تكون هناك حاجة لإعادة المحاولة');
        setSyncError('فشل في تهيئة Supabase');
      } else {
        console.log('تم تهيئة Supabase بنجاح');
        resetSyncError();
      }
      
      return initialized;
    } catch (error) {
      console.error('خطأ في تهيئة Supabase:', error);
      setSyncError(`خطأ في تهيئة Supabase: ${String(error)}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [resetSyncError]);
  
  // تنفيذ المزامنة الأولية مع Supabase
  const performInitialSync = useCallback(async () => {
    console.log('بدء المزامنة الأولية مع Supabase...');
    try {
      setIsSyncing(true);
      const success = await syncWithSupabase(false);
      
      if (success) {
        console.log('تمت المزامنة الأولية بنجاح مع Supabase');
        resetSyncError();
      } else {
        console.warn('فشلت المزامنة مع Supabase، جاري المحاولة مرة أخرى...');
        setSyncError('لم يمكن الاتصال بـ Supabase');
        
        // محاولة المزامنة مرة أخرى بعد تأخير
        setTimeout(async () => {
          try {
            const retrySuccess = await syncWithSupabase(false);
            if (retrySuccess) {
              console.log('نجحت إعادة المحاولة للمزامنة مع Supabase');
              resetSyncError();
            }
          } catch (retryError) {
            console.error('فشلت إعادة محاولة المزامنة:', retryError);
          }
        }, 10000);
      }
      
      return success;
    } catch (error) {
      console.error('خطأ في المزامنة الأولية مع Supabase:', error);
      setSyncError(String(error));
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [resetSyncError]);
  
  // معالجة إعادة الاتصال بالشبكة
  const handleOnline = useCallback(() => {
    checkNetworkStatus().then(({ hasInternet, hasServerAccess }) => {
      if (hasInternet) {
        toast({
          title: "تم استعادة الاتصال",
          description: hasServerAccess 
            ? "جاري تحديث البيانات من Supabase..." 
            : "تم استعادة الاتصال المحلي. جاري محاولة الوصول للخوادم...",
          duration: 5000,
        });
        
        if (hasServerAccess) {
          syncWithSupabase(false).catch(console.error);
          checkSourceAvailability().catch(console.error);
        }
      }
    }).catch(console.error);
  }, [toast, checkNetworkStatus, checkSourceAvailability]);
  
  // معالجة التركيز على التبويب
  const handleFocus = useCallback(() => {
    setTimeout(() => {
      console.log('تم اكتشاف العودة إلى التبويب، جاري التحقق من التحديثات...');
      
      checkNetworkStatus().then(({ hasInternet, hasServerAccess }) => {
        if (hasInternet && hasServerAccess && !isSyncing) {
          syncWithSupabase(false).catch(console.error);
        }
      }).catch(console.error);
    }, 1000);
  }, [checkNetworkStatus, isSyncing]);
  
  // التحقق من حالة الشبكة عند تحميل المكون
  useEffect(() => {
    console.log('تهيئة useAutoSync، التحقق من حالة الشبكة...');
    checkNetworkStatus().catch(console.error);
    
    // إعداد فحص دوري لحالة الشبكة
    const networkCheckInterval = setInterval(() => {
      checkNetworkStatus().catch(console.error);
    }, 5 * 60 * 1000); // فحص كل 5 دقائق
    
    return () => {
      clearInterval(networkCheckInterval);
    };
  }, [checkNetworkStatus]);
  
  return {
    syncError,
    availableSource,
    networkStatus,
    isSyncing,
    checkSourceAvailability,
    initializeSupabase,
    performInitialSync,
    handleOnline,
    handleFocus,
    resetSyncError,
    checkNetworkStatus
  };
};
