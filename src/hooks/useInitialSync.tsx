
import { useEffect, useRef, useState } from 'react';
import { syncWithSupabase, setupRealtimeSync } from '@/services/sync/supabaseSync';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useToast } from '@/hooks/use-toast';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';

/**
 * هوك مخصص لإدارة المزامنة الأولية
 */
export const useInitialSync = () => {
  const {
    checkSourceAvailability,
    initializeSupabase,
    performInitialSync,
    isSyncing
  } = useAutoSync();
  
  const { toast } = useToast();
  const syncAttemptsRef = useRef(0);
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const maxRetryAttemptsRef = useRef(isRunningOnVercel() ? 5 : 3);
  const lastSyncTimeRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // تنظيف عند فك تحميل المكون
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
        realtimeUnsubscribeRef.current = null;
      }
    };
  }, []);
  
  // وظيفة لتنفيذ المزامنة الأولية
  const performInitialSyncWithRetry = async () => {
    if (!isMountedRef.current) return false;
    
    console.log('بدء المزامنة الأولية مع Supabase');
    
    try {
      // التحقق من توفر المصادر
      await checkSourceAvailability();
      
      // تهيئة Supabase
      console.log("جاري تهيئة Supabase...");
      const supabaseInitialized = await initializeSupabase();
      
      if (supabaseInitialized) {
        console.log("تم تهيئة Supabase بنجاح، جاري تنفيذ المزامنة الأولية...");
        
        // تنفيذ المزامنة الأولية
        const syncSuccess = await performInitialSync();
        
        if (syncSuccess) {
          setIsInitialized(true);
          lastSyncTimeRef.current = Date.now();
          
          toast({
            title: "تم الاتصال بنجاح",
            description: "تم الاتصال بقاعدة بيانات Supabase ومزامنة البيانات",
          });
          
          return true;
        } else {
          console.warn("فشلت المزامنة الأولية، ستتم إعادة المحاولة...");
          return false;
        }
      } else {
        console.warn("فشلت تهيئة Supabase");
        return false;
      }
    } catch (error) {
      console.error('خطأ في الاتصال بـ Supabase:', error);
      return false;
    }
  };
  
  // وظيفة لإعادة المحاولة مع تأخير تصاعدي
  const retryWithDelay = () => {
    if (!isMountedRef.current || syncAttemptsRef.current >= maxRetryAttemptsRef.current) return;
    
    const retryDelay = 5000 + (syncAttemptsRef.current * 1000);
    console.log(`فشلت المزامنة، إعادة المحاولة بعد ${retryDelay}ms...`);
    
    setTimeout(() => {
      if (isMountedRef.current) {
        syncAttemptsRef.current++;
        console.log(`إعادة محاولة الاتصال (المحاولة ${syncAttemptsRef.current}/${maxRetryAttemptsRef.current})`);
        
        // إعادة محاولة المزامنة
        performInitialSyncWithRetry().then(success => {
          if (!success) retryWithDelay();
        });
      }
    }, retryDelay);
  };
  
  // وظيفة لإعداد المزامنة في الوقت الحقيقي
  const setupRealtimeSyncSubscription = () => {
    if (realtimeUnsubscribeRef.current === null) {
      console.log("إعداد الاشتراك في الوقت الحقيقي مع Supabase");
      realtimeUnsubscribeRef.current = setupRealtimeSync();
    }
  };
  
  // وظيفة لإعداد المزامنة الدورية - تعديل نوع الإرجاع إلى NodeJS.Timeout
  const setupPeriodicSync = (): NodeJS.Timeout => {
    const baseSyncInterval = isRunningOnVercel() ? 6 * 60 * 1000 : 5 * 60 * 1000;
    const randomOffset = Math.random() * 60 * 1000;
    const syncInterval = baseSyncInterval + randomOffset;
    
    console.log(`تم إعداد المزامنة الدورية كل ${Math.round(syncInterval / 60000)} دقائق تقريبًا`);
    
    const intervalId = setInterval(() => {
      const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
      const minSyncInterval = 2 * 60 * 1000;
      
      if (isMountedRef.current && !isSyncing && timeSinceLastSync > minSyncInterval) {
        console.log('تنفيذ المزامنة الدورية مع Supabase');
        syncWithSupabase(false)
          .then(success => {
            if (success) lastSyncTimeRef.current = Date.now();
          })
          .catch(console.error);
        
        checkSourceAvailability().catch(console.error);
      } else if (isSyncing) {
        console.log('تم تخطي المزامنة الدورية لأن هناك مزامنة نشطة بالفعل');
      } else if (timeSinceLastSync <= minSyncInterval) {
        console.log(`تم تخطي المزامنة الدورية لأن آخر مزامنة كانت منذ ${Math.round(timeSinceLastSync / 1000)} ثانية فقط`);
      }
    }, syncInterval);
    
    return intervalId;
  };
  
  return {
    isInitialized,
    syncAttemptsRef,
    maxRetryAttemptsRef,
    isMountedRef,
    performInitialSyncWithRetry,
    retryWithDelay,
    setupRealtimeSyncSubscription,
    setupPeriodicSync,
  };
};
