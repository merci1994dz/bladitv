
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
