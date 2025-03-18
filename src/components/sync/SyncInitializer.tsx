
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
    isSyncing,
    networkStatus,
    syncError,
    resetSyncError
  } = useAutoSync();
  
  const { toast } = useToast();
  const syncAttemptsRef = useRef(0);
  const realtimeUnsubscribeRef = useRef<() => void | null>(null);
  const isMountedRef = useRef(true);
  const lastSyncTimeRef = useRef(0);
  const [hasSynced, setHasSynced] = useState(false);
  
  // تهيئة المزامنة - استخدام Supabase فقط عند الاتصال بالإنترنت
  useEffect(() => {
    // فحص إذا كان الاتصال بالإنترنت متاح
    const hasInternetConnection = navigator.onLine && networkStatus.hasInternet;
    
    // إذا كان الاتصال بالإنترنت متاح، نستخدم Supabase فقط
    if (hasInternetConnection) {
      console.log('تم اكتشاف اتصال بالإنترنت، البدء بالمزامنة مع Supabase');
      
      const initialSyncTimeout = setTimeout(async () => {
        if (!isMountedRef.current) return;
        
        console.log('بدء المزامنة الأولية مع Supabase');
        
        const initialize = async () => {
          try {
            resetSyncError(); // إعادة تعيين أي خطأ سابق
            
            // التحقق من توفر المصادر
            await checkSourceAvailability();
            
            // تهيئة Supabase
            const supabaseInitialized = await initializeSupabase();
            
            if (supabaseInitialized) {
              // تنفيذ المزامنة الأولية
              await performInitialSync();
              setHasSynced(true);
              
              toast({
                title: "تم الاتصال بالخادم",
                description: "تم الاتصال بخادم Supabase بنجاح وتحديث البيانات",
                duration: 3000,
              });
            } else {
              // إعادة المحاولة بعد تأخير إذا فشلت تهيئة Supabase
              setTimeout(() => {
                if (isMountedRef.current && syncAttemptsRef.current < 3) {
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
              // عند فشل المزامنة، نبلغ المستخدم بدلاً من استخدام البيانات المحلية
              toast({
                title: "تعذر المزامنة مع الخادم",
                description: "هناك مشكلة في الاتصال بالخادم. الرجاء المحاولة مرة أخرى لاحقًا.",
                variant: "destructive",
                duration: 7000,
              });
            }
          }
        };
        
        initialize();
      }, 1000);
      
      // إعداد مزامنة دورية
      const randomInterval = 10 * 60 * 1000 + (Math.random() * 2 * 60 * 1000);
      
      const syncInterval = setInterval(() => {
        if (!isMountedRef.current || isSyncing) return;
        
        // تجنب المزامنة المتكررة جدًا
        const now = Date.now();
        if (now - lastSyncTimeRef.current < 5 * 60 * 1000) {
          console.log('تم تخطي المزامنة الدورية: لم يمر وقت كافٍ منذ آخر مزامنة');
          return;
        }
        
        // تنفيذ المزامنة فقط إذا كان الاتصال بالإنترنت متاحًا
        if (navigator.onLine && networkStatus.hasInternet) {
          console.log('تنفيذ المزامنة الدورية مع Supabase');
          lastSyncTimeRef.current = now;
          
          syncWithSupabase(false).catch(error => {
            console.error('خطأ في المزامنة الدورية:', error);
          });
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
    } else {
      // إذا لم يكن هناك اتصال بالإنترنت، نستخدم البيانات المحلية فقط
      console.log('لا يوجد اتصال بالإنترنت، استخدام البيانات المحلية فقط');
      loadFromLocalStorage();
      
      toast({
        title: "لا يوجد اتصال بالخادم",
        description: "جاري استخدام البيانات المخزنة محليًا. سيتم المزامنة عند استعادة الاتصال.",
        duration: 5000,
      });
      
      // إعداد مستمع للاتصال بالإنترنت لبدء المزامنة عند عودة الاتصال
      const onlineHandler = () => {
        console.log('تم استعادة الاتصال بالإنترنت، بدء المزامنة');
        toast({
          title: "تم استعادة الاتصال",
          description: "جاري محاولة الاتصال بالخادم...",
          duration: 3000,
        });
        handleOnline();
      };
      
      window.addEventListener('online', onlineHandler);
      
      return () => {
        window.removeEventListener('online', onlineHandler);
      };
    }
  }, [checkSourceAvailability, initializeSupabase, performInitialSync, handleOnline, handleFocus, isSyncing, toast, networkStatus, resetSyncError]);
  
  // عرض رسالة خطأ المزامنة إذا كان هناك خطأ
  useEffect(() => {
    if (syncError) {
      console.error('خطأ في المزامنة:', syncError);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر الاتصال بالخادم. جاري استخدام البيانات المحلية.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [syncError, toast]);
  
  return <>{children}</>;
};

export default SyncInitializer;
