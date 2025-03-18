
import React, { useEffect, useRef, useState } from 'react';
import { syncWithSupabase, setupRealtimeSync } from '@/services/sync/supabaseSync';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useToast } from '@/hooks/use-toast';
import { loadFromLocalStorage } from '@/services/dataStore/storage';

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
  const lastSyncTimeRef = useRef(0);
  const [hasSynced, setHasSynced] = useState(false);
  
  // تهيئة المزامنة مع آلية إعادة المحاولة المحسنة
  useEffect(() => {
    // تحميل البيانات من التخزين المحلي أولاً - فوري
    // Load data from local storage first - immediate
    loadFromLocalStorage();
    
    // تعيين مؤقت للتهيئة الأولية مع تأخير قصير لمنع التعارضات
    // Set timer for initial sync with short delay to prevent conflicts
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
            setHasSynced(true);
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
            
            // محاولة تحميل البيانات المحلية مرة أخرى
            loadFromLocalStorage();
          }
        }
      };
      
      initialize();
    }, 1500); // تقليل التأخير إلى 1.5 ثانية فقط
    
    // إعداد مزامنة دورية بوقت عشوائي لمنع تزامن الطلبات من عدة مستخدمين
    const randomInterval = 10 * 60 * 1000 + (Math.random() * 2 * 60 * 1000);
    
    const syncInterval = setInterval(() => {
      if (!isMountedRef.current || isSyncing) return;
      
      // تجنب المزامنة المتكررة جدًا
      // Avoid too frequent sync
      const now = Date.now();
      if (now - lastSyncTimeRef.current < 5 * 60 * 1000) {
        console.log('تم تخطي المزامنة الدورية: لم يمر وقت كافٍ منذ آخر مزامنة');
        return;
      }
      
      console.log('تنفيذ المزامنة الدورية مع Supabase');
      lastSyncTimeRef.current = now;
      
      syncWithSupabase(false).catch(error => {
        console.error('خطأ في المزامنة الدورية:', error);
        // محاولة تحميل البيانات المحلية في حالة فشل المزامنة
        loadFromLocalStorage();
      });
      
      // إعادة التحقق من المصادر المتاحة دوريًا
      checkSourceAvailability().catch(console.error);
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
