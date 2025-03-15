
import React, { useEffect, useState } from 'react';
import { syncAllData } from '@/services/sync';
import { useToast } from '@/hooks/use-toast';
import { broadcastSettingsUpdate } from '@/services/sync/settingsSync';

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

const AutoSyncProvider: React.FC<AutoSyncProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [syncError, setSyncError] = useState<string | null>(null);
  
  useEffect(() => {
    // وظيفة المزامنة المحسنة مع معالجة الأخطاء
    const performSync = async () => {
      try {
        await syncAllData(true);
        setSyncError(null);
      } catch (error) {
        console.error('خطأ في المزامنة التلقائية:', error);
        setSyncError(String(error));
      }
    };
    
    // تنفيذ المزامنة عند بدء التشغيل
    performSync();
    
    // إعداد مزامنة تلقائية كل دقيقتين
    const syncInterval = setInterval(() => {
      performSync();
    }, 2 * 60 * 1000);
    
    // إعداد مستمع لحالة الاتصال بالإنترنت
    const handleOnline = () => {
      toast({
        title: "تم استعادة الاتصال",
        description: "جاري تحديث البيانات...",
        duration: 3000,
      });
      performSync();
    };
    
    window.addEventListener('online', handleOnline);
    
    // إضافة مستمع لتنشيط النافذة
    const handleFocus = () => {
      performSync();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // إنشاء فاصل زمني لنشر حالة التحديث للتأكد من انتشار التغييرات
    const broadcastInterval = setInterval(() => {
      broadcastSettingsUpdate();
    }, 5 * 60 * 1000);
    
    return () => {
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
      }, 5000); // انتظر 5 ثوان قبل عرض الخطأ للمستخدم
      
      return () => clearTimeout(errorTimeout);
    }
  }, [syncError, toast]);
  
  return <>{children}</>;
};

export default AutoSyncProvider;
