
import React, { useEffect, useRef, useState } from 'react';
import { syncWithSupabase, setupRealtimeSync } from '@/services/sync/supabaseSync';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useToast } from '@/hooks/use-toast';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';

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
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const maxRetryAttemptsRef = useRef(isRunningOnVercel() ? 5 : 3); // زيادة عدد المحاولات على Vercel
  const lastSyncTimeRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // تهيئة المزامنة مع آلية إعادة المحاولة المحسنة
  useEffect(() => {
    // تعيين مؤقت للتهيئة الأولية مع تأخير لمنع التعارضات
    const initialDelay = isRunningOnVercel() ? 5000 : 3000;
    console.log(`سيتم بدء المزامنة الأولية بعد ${initialDelay}ms`);
    
    const initialSyncTimeout = setTimeout(async () => {
      if (!isMountedRef.current) return;
      
      console.log('بدء المزامنة الأولية مع Supabase');
      
      const initialize = async () => {
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
            } else {
              console.warn("فشلت المزامنة الأولية، ستتم إعادة المحاولة...");
              // سنترك إعادة المحاولة للكود أدناه
            }
          } else {
            // إعادة المحاولة بعد تأخير إذا فشلت تهيئة Supabase
            const retryDelay = 5000 + (syncAttemptsRef.current * 1000);
            console.log(`فشلت تهيئة Supabase، إعادة المحاولة بعد ${retryDelay}ms...`);
            
            setTimeout(() => {
              if (isMountedRef.current) {
                syncAttemptsRef.current++;
                console.log(`إعادة محاولة الاتصال بـ Supabase (المحاولة ${syncAttemptsRef.current}/${maxRetryAttemptsRef.current})`);
                initialize();
              }
            }, retryDelay);
          }
        } catch (error) {
          console.error('خطأ في الاتصال بـ Supabase:', error);
          
          // إعادة المحاولة عدة مرات قبل الاستسلام
          if (syncAttemptsRef.current < maxRetryAttemptsRef.current) {
            const retryDelay = 7000 * (syncAttemptsRef.current + 1); // زيادة التأخير مع كل محاولة
            
            setTimeout(() => {
              if (isMountedRef.current) {
                syncAttemptsRef.current++;
                console.log(`إعادة محاولة الاتصال (المحاولة ${syncAttemptsRef.current}/${maxRetryAttemptsRef.current}) بعد ${retryDelay}ms`);
                initialize();
              }
            }, retryDelay);
          } else {
            // إذا استمر الفشل، أخبر المستخدم وتحديث الحالة
            console.warn(`فشلت جميع محاولات الاتصال (${maxRetryAttemptsRef.current})، سيتم استخدام البيانات المحلية`);
            
            toast({
              title: "تعذر الاتصال بـ Supabase",
              description: "سيتم استخدام البيانات المخزنة محليًا. الرجاء التحقق من اتصالك بالإنترنت.",
              variant: "destructive",
              duration: 7000,
            });
            
            // على الرغم من فشل الاتصال، نعتبر التطبيق مهيأ لنتمكن من عرض البيانات المحلية
            setIsInitialized(true);
          }
        }
      };
      
      initialize();
    }, initialDelay);
    
    // إعداد مزامنة دورية
    const setupPeriodicSync = () => {
      // تحديد فترة المزامنة الدورية بناءً على البيئة
      const baseSyncInterval = isRunningOnVercel() ? 6 * 60 * 1000 : 5 * 60 * 1000; // 6 دقائق على Vercel، 5 دقائق في غير ذلك
      const randomOffset = Math.random() * 60 * 1000; // تباين عشوائي حتى دقيقة واحدة
      const syncInterval = baseSyncInterval + randomOffset;
      
      console.log(`تم إعداد المزامنة الدورية كل ${Math.round(syncInterval / 60000)} دقائق تقريبًا`);
      
      return setInterval(() => {
        // التأكد من أن الفاصل الزمني بين عمليات المزامنة كافٍ لمنع التعارضات
        const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
        const minSyncInterval = 2 * 60 * 1000; // دقيقتان كحد أدنى بين عمليات المزامنة
        
        if (isMountedRef.current && !isSyncing && timeSinceLastSync > minSyncInterval) {
          console.log('تنفيذ المزامنة الدورية مع Supabase');
          syncWithSupabase(false)
            .then(success => {
              if (success) {
                lastSyncTimeRef.current = Date.now();
              }
            })
            .catch(console.error);
          
          // إعادة التحقق من المصادر المتاحة دوريًا
          checkSourceAvailability().catch(console.error);
        } else if (isSyncing) {
          console.log('تم تخطي المزامنة الدورية لأن هناك مزامنة نشطة بالفعل');
        } else if (timeSinceLastSync <= minSyncInterval) {
          console.log(`تم تخطي المزامنة الدورية لأن آخر مزامنة كانت منذ ${Math.round(timeSinceLastSync / 1000)} ثانية فقط`);
        }
      }, syncInterval);
    };
    
    // إعداد اشتراك في الوقت الحقيقي بعد التهيئة الأولية
    const setupInitialRealtimeSync = () => {
      // التأكد من أننا لم نقم بإعداد الاشتراك في الوقت الحقيقي بالفعل
      if (realtimeUnsubscribeRef.current === null) {
        console.log("إعداد الاشتراك في الوقت الحقيقي مع Supabase");
        realtimeUnsubscribeRef.current = setupRealtimeSync();
      }
    };
    
    // إعداد المزامنة الدورية
    const syncIntervalId = setupPeriodicSync();
    
    // إعداد الاشتراك في الوقت الحقيقي
    setupInitialRealtimeSync();
    
    // إعداد مستمعي الشبكة
    window.addEventListener('online', handleOnline);
    
    // إعداد مستمعي التركيز/التشويش
    window.addEventListener('focus', handleFocus);
    
    // تخزين معلومات عن Vercel إذا كان التطبيق يعمل عليه
    if (isRunningOnVercel()) {
      try {
        localStorage.setItem('vercel_deployment', 'true');
        localStorage.setItem('vercel_sync_enabled', 'true');
        localStorage.setItem('vercel_app_started', new Date().toISOString());
        
        // محاولة الحصول على معرف البناء من URL إذا كان متاحًا
        const urlParams = new URLSearchParams(window.location.search);
        const buildId = urlParams.get('buildId') || urlParams.get('__vercel_deployment_id');
        if (buildId) {
          localStorage.setItem('vercel_build_id', buildId);
        }
      } catch (e) {
        console.warn('تعذر تخزين معلومات Vercel:', e);
      }
    }
    
    // تنظيف جميع المستمعين والمؤقتات
    return () => {
      isMountedRef.current = false;
      clearTimeout(initialSyncTimeout);
      clearInterval(syncIntervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
        realtimeUnsubscribeRef.current = null;
      }
    };
  }, [checkSourceAvailability, initializeSupabase, performInitialSync, handleOnline, handleFocus, isSyncing, toast]);
  
  return <>{children}</>;
};

export default SyncInitializer;
