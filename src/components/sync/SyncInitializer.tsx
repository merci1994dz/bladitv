
import React, { useEffect, useRef } from 'react';
import { setupRealtimeSync, syncWithSupabase } from '@/services/sync/supabaseSync';
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
  const realtimeUnsubscribeRef = useRef<() => void | null>(null);
  const isMountedRef = useRef(true);
  
  // تهيئة المزامنة مع آلية إعادة المحاولة المحسنة
  useEffect(() => {
    // تعيين مؤقت للتهيئة الأولية مع تأخير لمنع التعارضات
    const initialSyncTimeout = setTimeout(async () => {
      if (!isMountedRef.current) return;
      
      console.log('بدء المزامنة الأولية مع حماية أفضل ضد الفشل');
      
      const initialize = async () => {
        try {
          // التحقق من توفر المصادر
          await checkSourceAvailability();
          
          // تهيئة Supabase
          const supabaseInitialized = await initializeSupabase();
          
          if (supabaseInitialized) {
            // تنفيذ المزامنة الأولية
            await performInitialSync();
          } else {
            // إعادة المحاولة بعد تأخير إذا فشلت تهيئة Supabase
            setTimeout(() => {
              if (isMountedRef.current) {
                syncAttemptsRef.current++;
                console.log(`إعادة محاولة المزامنة (المحاولة ${syncAttemptsRef.current}/3)`);
                initialize();
              }
            }, 5000);
          }
        } catch (error) {
          console.error('خطأ في التهيئة الأولية للمزامنة:', error);
          
          // إعادة المحاولة عدة مرات قبل الاستسلام
          if (syncAttemptsRef.current < 3) {
            setTimeout(() => {
              if (isMountedRef.current) {
                syncAttemptsRef.current++;
                console.log(`إعادة محاولة المزامنة (المحاولة ${syncAttemptsRef.current}/3)`);
                initialize();
              }
            }, 7000 * syncAttemptsRef.current); // زيادة التأخير مع كل محاولة
          } else {
            // إذا استمر الفشل، أخبر المستخدم وتحديث الحالة
            toast({
              title: "تعذر المزامنة",
              description: "سيتم استخدام البيانات المخزنة محليًا. الرجاء التحقق من اتصالك بالإنترنت.",
              variant: "destructive",
              duration: 7000,
            });
          }
        }
      };
      
      initialize();
    }, 3000);
    
    // إعداد مزامنة دورية كل 5 دقائق مع إضافة عشوائية لمنع التزامن
    const randomInterval = 5 * 60 * 1000 + (Math.random() * 30 * 1000);
    const syncInterval = setInterval(() => {
      if (isMountedRef.current && !isSyncing) {
        console.log('تنفيذ المزامنة الدورية مع Supabase');
        syncWithSupabase(false).catch(console.error);
        
        // إعادة التحقق من المصادر المتاحة دوريًا
        checkSourceAvailability().catch(console.error);
      }
    }, randomInterval);
    
    // إعداد مستمعي الشبكة
    window.addEventListener('online', handleOnline);
    
    // إعداد اشتراك في الوقت الحقيقي
    realtimeUnsubscribeRef.current = setupRealtimeSync();
    
    // إعداد مستمعي التركيز/التشويش
    window.addEventListener('focus', handleFocus);
    
    // تنظيف جميع المستمعين والمؤقتات
    return () => {
      isMountedRef.current = false;
      clearTimeout(initialSyncTimeout);
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
      }
    };
  }, [checkSourceAvailability, initializeSupabase, performInitialSync, handleOnline, handleFocus, isSyncing, toast]);
  
  return <>{children}</>;
};

export default SyncInitializer;
