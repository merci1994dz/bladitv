
import React, { useCallback, useEffect, useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import SyncErrorNotification from './sync/SyncErrorNotification';
import AvailableSourceLogger from './sync/AvailableSourceLogger';
import SyncInitializer from './sync/SyncInitializer';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status';

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

const AutoSyncProvider: React.FC<AutoSyncProviderProps> = ({ children }) => {
  const { syncError, availableSource, networkStatus, resetSyncError } = useAutoSync();
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  
  // معالجة أحداث تحديث القنوات
  useEffect(() => {
    const handleChannelsUpdate = (e: CustomEvent) => {
      const { timestamp, source } = e.detail || {};
      console.log('تم استلام إشعار بتحديث القنوات:', { timestamp, source });
      
      setLastUpdateTime(new Date().toLocaleString());
      
      // إظهار إشعار للمستخدم
      toast({
        title: "تم تحديث القنوات",
        description: "تم تحديث قائمة القنوات المتاحة. سيتم تحديث الصفحة تلقائيًا.",
        duration: 4000,
      });
      
      // تأخير التحديث لإتاحة الوقت للمستخدم لقراءة الإشعار
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };
    
    // إضافة مستمع لأحداث تحديث القنوات
    window.addEventListener('channels_updated', handleChannelsUpdate as EventListener);
    
    // إضافة مستمع للتغييرات في مخزن البيانات المحلي
    const handleStorageChange = (e: StorageEvent) => {
      const forceRefreshKeys = [
        'force_browser_refresh',
        'bladi_force_refresh',
        'force_update',
        'force_reload_all'
      ];
      
      if (e.key && forceRefreshKeys.includes(e.key) && e.newValue === 'true') {
        console.log('تم اكتشاف طلب تحديث من مصدر خارجي:', e.key);
        
        // إظهار إشعار للمستخدم
        toast({
          title: "طلب تحديث",
          description: "تم استلام طلب لتحديث صفحة القنوات. سيتم التحديث تلقائيًا.",
        });
        
        // تأخير التحديث لإتاحة الوقت للمستخدم لقراءة الإشعار
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };
    
    // إضافة مستمع للتغييرات في التخزين المحلي
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('channels_updated', handleChannelsUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [toast]);
  
  // التعامل مع تغييرات حالة الشبكة
  const handleNetworkChange = useCallback(async () => {
    const isOnline = navigator.onLine;
    setIsOffline(!isOnline);
    
    if (isOnline) {
      // عند استعادة الاتصال، تحقق من مشاكل الاتصال المحتملة
      const { hasInternet, hasServerAccess } = await checkConnectivityIssues();
      
      if (hasInternet) {
        toast({
          title: "تم استعادة الاتصال",
          description: hasServerAccess 
            ? "جاري تحديث البيانات من المصادر المتاحة..." 
            : "تم استعادة الاتصال المحلي فقط. سيتم الاعتماد على البيانات المخزنة.",
          duration: 4000,
        });
        
        // إعادة تعيين حالة الخطأ عند العودة للاتصال
        if (syncError) {
          resetSyncError();
        }
      }
    } else {
      toast({
        title: "انقطع الاتصال",
        description: "أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [syncError, resetSyncError, toast]);
  
  // إضافة استمعات لتغييرات حالة الشبكة
  useEffect(() => {
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // التحقق من حالة الشبكة عند التحميل
    handleNetworkChange();
    
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [handleNetworkChange]);
  
  return (
    <>
      {/* عرض إشعار للمستخدم عندما يكون في وضع عدم الاتصال */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-center py-1 px-2 text-sm sticky top-0 z-50">
          أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.
        </div>
      )}
      
      {/* إظهار شريط إشعار عند تحديث القنوات مؤخرًا */}
      {lastUpdateTime && (
        <div className="bg-green-500 text-white text-center py-1 px-2 text-sm sticky top-0 z-50">
          تم تحديث القنوات في {lastUpdateTime}
        </div>
      )}
      
      {/* معالجة تهيئة المزامنة والاستماع للأحداث */}
      <SyncInitializer>
        {/* عرض إشعارات الخطأ */}
        <SyncErrorNotification syncError={syncError} />
        
        {/* تسجيل المصادر المتاحة في وضع التطوير */}
        <AvailableSourceLogger availableSource={availableSource} />
        
        {/* عرض الأطفال */}
        {children}
      </SyncInitializer>
    </>
  );
};

export default AutoSyncProvider;
