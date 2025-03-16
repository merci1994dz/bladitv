
import React, { useEffect, useState } from 'react';
import { syncWithSupabase, setupRealtimeSync, initializeSupabaseTables } from '@/services/sync/supabaseSync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import { useToast } from '@/hooks/use-toast';

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

const AutoSyncProvider: React.FC<AutoSyncProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  
  useEffect(() => {
    // تهيئة جداول Supabase وتحميل البيانات الأولية
    const initializeSupabase = async () => {
      try {
        await initializeSupabaseTables();
      } catch (error) {
        console.error('خطأ في تهيئة Supabase:', error);
      }
    };
    
    // التحقق من توفر أي من روابط Bladi Info
    const checkSourceAvailability = async () => {
      try {
        const availableUrl = await checkBladiInfoAvailability();
        setAvailableSource(availableUrl);
        if (availableUrl) {
          console.log(`وجدنا مصدر بيانات متاح: ${availableUrl}`);
        } else {
          console.warn('لم نتمكن من العثور على أي مصدر بيانات متاح');
        }
      } catch (error) {
        console.error('خطأ في التحقق من توفر المصادر:', error);
      }
    };
    
    // مزامنة البيانات مع Supabase عند بدء التشغيل
    const performInitialSync = async () => {
      console.log('بدء المزامنة الأولية مع Supabase...');
      try {
        const success = await syncWithSupabase(false);
        if (success) {
          console.log('تمت المزامنة الأولية بنجاح مع Supabase');
          setSyncError(null);
        } else {
          console.warn('فشلت المزامنة مع Supabase، جاري المحاولة مرة أخرى...');
          setSyncError('لم يمكن الاتصال بـ Supabase');
        }
      } catch (error) {
        console.error('خطأ في المزامنة الأولية مع Supabase:', error);
        setSyncError(String(error));
      }
    };
    
    // تنفيذ الوظائف بالترتيب المناسب
    const initialize = async () => {
      await checkSourceAvailability();
      await initializeSupabase();
      await performInitialSync();
    };
    
    // تأخير المزامنة الأولية لمنع التعارض مع التهيئة الأولية
    const initialSyncTimeout = setTimeout(() => {
      console.log('بدء المزامنة الأولية في AutoSyncProvider');
      initialize();
    }, 3000);
    
    // إعداد مزامنة تلقائية كل 5 دقائق
    const syncInterval = setInterval(() => {
      console.log('تنفيذ المزامنة الدورية مع Supabase');
      syncWithSupabase(false);
      
      // إعادة التحقق من المصادر المتاحة كل فترة
      checkSourceAvailability();
    }, 5 * 60 * 1000);
    
    // إعداد مستمع لحالة الاتصال بالإنترنت
    const handleOnline = () => {
      toast({
        title: "تم استعادة الاتصال",
        description: "جاري تحديث البيانات من Supabase...",
        duration: 3000,
      });
      syncWithSupabase(false);
      
      // إعادة التحقق من المصادر المتاحة عند استعادة الاتصال
      checkSourceAvailability();
    };
    
    window.addEventListener('online', handleOnline);
    
    // إعداد الاشتراك في تحديثات البيانات في الوقت الحقيقي
    const unsubscribeRealtime = setupRealtimeSync();
    
    // إضافة مستمع لتنشيط النافذة مع تأخير
    const handleFocus = () => {
      // تأخير بسيط لمنع المزامنات المتكررة عند التبديل بين علامات التبويب
      setTimeout(() => {
        console.log('تم اكتشاف العودة إلى التبويب، جاري التحقق من التحديثات...');
        syncWithSupabase(false);
      }, 1000);
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearTimeout(initialSyncTimeout);
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      unsubscribeRealtime();
    };
  }, [toast]);
  
  // عرض معلومات الخطأ فقط إذا استمر الخطأ
  useEffect(() => {
    if (syncError) {
      const errorTimeout = setTimeout(() => {
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر تحديث البيانات من Supabase. سيتم إعادة المحاولة تلقائيًا.",
          variant: "destructive",
          duration: 5000,
        });
      }, 5000);
      
      return () => clearTimeout(errorTimeout);
    }
  }, [syncError, toast]);
  
  // عرض معلومات عن المصدر المتاح إذا تم العثور عليه (للتطوير فقط)
  useEffect(() => {
    if (availableSource && process.env.NODE_ENV === 'development') {
      console.log(`المصدر المتاح للبيانات: ${availableSource}`);
    }
  }, [availableSource]);
  
  return <>{children}</>;
};

export default AutoSyncProvider;
