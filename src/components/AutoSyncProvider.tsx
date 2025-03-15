
import React, { useEffect, useState } from 'react';
import { syncAllData, syncWithBladiInfo } from '@/services/sync';
import { useToast } from '@/hooks/use-toast';
import { broadcastSettingsUpdate } from '@/services/sync/settingsSync';

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

const AutoSyncProvider: React.FC<AutoSyncProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [syncError, setSyncError] = useState<string | null>(null);
  
  useEffect(() => {
    // محاولة المزامنة مع bladi-info.com أو bladitv.lovable.app أولاً
    const performInitialBladiSync = async () => {
      console.log('جاري محاولة المزامنة مع مواقع Bladi Info...');
      try {
        const success = await syncWithBladiInfo();
        if (success) {
          console.log('تمت المزامنة الأولية بنجاح مع مواقع Bladi Info');
          setSyncError(null);
        } else {
          console.warn('فشلت المزامنة مع مواقع Bladi Info، جاري المحاولة مع المصادر الأخرى');
          await performSync();
        }
      } catch (error) {
        console.error('خطأ في المزامنة الأولية مع مواقع Bladi Info:', error);
        await performSync();
      }
    };
    
    // وظيفة المزامنة المحسنة مع تجنب المزامنات المتكررة
    const performSync = async () => {
      try {
        await syncAllData(false); // استخدام false لتجنب المزامنات المتكررة عند بدء التشغيل
        setSyncError(null);
      } catch (error) {
        console.error('خطأ في المزامنة التلقائية:', error);
        setSyncError(String(error));
      }
    };
    
    // تأخير المزامنة الأولية لمنع التعارض مع التهيئة الأولية
    const initialSyncTimeout = setTimeout(() => {
      console.log('بدء المزامنة الأولية في AutoSyncProvider');
      performInitialBladiSync();
    }, 3000);
    
    // إعداد مزامنة تلقائية كل 5 دقائق
    const syncInterval = setInterval(() => {
      console.log('تنفيذ المزامنة الدورية');
      performInitialBladiSync();
    }, 5 * 60 * 1000);
    
    // إعداد مستمع لحالة الاتصال بالإنترنت
    const handleOnline = () => {
      toast({
        title: "تم استعادة الاتصال",
        description: "جاري تحديث البيانات...",
        duration: 3000,
      });
      performInitialBladiSync();
    };
    
    window.addEventListener('online', handleOnline);
    
    // إضافة مستمع لتنشيط النافذة مع تأخير
    const handleFocus = () => {
      // تأخير بسيط لمنع المزامنات المتكررة عند التبديل بين علامات التبويب
      setTimeout(() => {
        console.log('تم اكتشاف العودة إلى التبويب، جاري التحقق من التحديثات...');
        performInitialBladiSync();
      }, 1000);
    };
    
    window.addEventListener('focus', handleFocus);
    
    // إنشاء فاصل زمني لنشر حالة التحديث
    const broadcastInterval = setInterval(() => {
      broadcastSettingsUpdate();
    }, 10 * 60 * 1000);
    
    return () => {
      clearTimeout(initialSyncTimeout);
      clearInterval(syncInterval);
      clearInterval(broadcastInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [toast]);
  
  // عرض معلومات الخطأ فقط إذا استمر الخطأ
  useEffect(() => {
    if (syncError) {
      const errorTimeout = setTimeout(() => {
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر تحديث البيانات. سيتم إعادة المحاولة تلقائيًا.",
          variant: "destructive",
          duration: 5000,
        });
      }, 5000);
      
      return () => clearTimeout(errorTimeout);
    }
  }, [syncError, toast]);
  
  return <>{children}</>;
};

export default AutoSyncProvider;
