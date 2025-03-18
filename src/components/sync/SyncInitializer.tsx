
import React, { useEffect, useRef, useState } from 'react';
import { syncWithSupabase, setupRealtimeSync } from '@/services/sync/supabaseSync';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useToast } from '@/hooks/use-toast';

interface SyncInitializerProps {
  children: React.ReactNode;
}

const SyncInitializer: React.FC<SyncInitializerProps> = ({ children }) => {
  const {
    checkSourceAvailability,
    initializeSupabase,
    performInitialSync,
    handleOnline,
    handleFocus,
    isSyncing
  } = useAutoSync();
  
  const { toast } = useToast();
  const syncAttemptsRef = useRef(0);
  const realtimeUnsubscribeRef = useRef<null | (() => void)>(null);
  const isMountedRef = useRef(true);
  const [syncInitialized, setSyncInitialized] = useState(false);
  
  // تهيئة المزامنة مع آلية إعادة المحاولة المحسنة
  useEffect(() => {
    // تفادي تكرار عملية التهيئة
    if (syncInitialized) return;
    
    // تعيين مؤقت للتهيئة الأولية مع تأخير لمنع التعارضات
    const initialSyncTimeout = setTimeout(async () => {
      if (!isMountedRef.current) return;
      
      console.log('بدء المزامنة الأولية بطريقة محسنة');
      setSyncInitialized(true);
      
      const initialize = async () => {
        try {
          // التحقق من توفر المصادر بعملية متوازية
          checkSourceAvailability().catch(console.error);
          
          // تهيئة Supabase
          const supabaseInitialized = await initializeSupabase();
          
          if (supabaseInitialized) {
            // تنفيذ المزامنة الأولية
            await performInitialSync();
            
            // إعداد مزامنة في الوقت الحقيقي بعد نجاح المزامنة الأولية
            realtimeUnsubscribeRef.current = setupRealtimeSync();
          } else {
            // إعادة المحاولة بشكل تدريجي إذا فشلت تهيئة Supabase
            const retryDelay = Math.min(3000 * (syncAttemptsRef.current + 1), 10000);
            
            setTimeout(() => {
              if (isMountedRef.current && syncAttemptsRef.current < 3) {
                syncAttemptsRef.current++;
                console.log(`إعادة محاولة التهيئة (المحاولة ${syncAttemptsRef.current}/3) بعد ${retryDelay}ms`);
                initialize();
              }
            }, retryDelay);
          }
        } catch (error) {
          console.error('خطأ في التهيئة الأولية للمزامنة:', error);
          
          // إعادة المحاولة عدة مرات قبل الاستسلام مع زيادة وقت الانتظار
          if (syncAttemptsRef.current < 3) {
            setTimeout(() => {
              if (isMountedRef.current) {
                syncAttemptsRef.current++;
                console.log(`إعادة محاولة التهيئة (المحاولة ${syncAttemptsRef.current}/3)`);
                initialize();
              }
            }, 5000 * syncAttemptsRef.current);
          } else {
            // إذا استمر الفشل، أخبر المستخدم
            toast({
              title: "تعذر المزامنة",
              description: "سيتم استخدام البيانات المخزنة محليًا. يرجى التحقق من اتصالك بالإنترنت.",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      };
      
      // بدء عملية التهيئة
      initialize();
    }, 1500); // تقليل التأخير الأولي إلى 1.5 ثانية
    
    // مستمعو الشبكة
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);
    
    // تنظيف جميع المستمعين والمؤقتات
    return () => {
      isMountedRef.current = false;
      clearTimeout(initialSyncTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
        realtimeUnsubscribeRef.current = null;
      }
    };
  }, [
    checkSourceAvailability, 
    initializeSupabase, 
    performInitialSync, 
    handleOnline, 
    handleFocus, 
    syncInitialized, 
    toast
  ]);
  
  // المزامنة الدورية على فترات متباعدة بعد التهيئة الأولية
  useEffect(() => {
    if (!syncInitialized) return;
    
    // إضافة عامل عشوائي لمنع مزامنة جميع العملاء في نفس الوقت
    const randomOffset = Math.floor(Math.random() * 60000); // 0-60 ثانية
    const syncInterval = 10 * 60 * 1000 + randomOffset; // ~10 دقائق + عامل عشوائي
    
    const intervalId = setInterval(() => {
      if (isMountedRef.current && !isSyncing && navigator.onLine) {
        // تنفيذ المزامنة الدورية مع Supabase
        syncWithSupabase(false).catch(console.error);
      }
    }, syncInterval);
    
    return () => clearInterval(intervalId);
  }, [isSyncing, syncInitialized]);
  
  return <>{children}</>;
};

export default SyncInitializer;
