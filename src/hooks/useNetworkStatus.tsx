
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity/connectivity-checker';

export const useNetworkStatus = () => {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [networkStatus, setNetworkStatus] = useState<{
    hasInternet: boolean;
    hasServerAccess: boolean;
  }>({ hasInternet: navigator.onLine, hasServerAccess: false });
  const [lastCheckTime, setLastCheckTime] = useState(0);

  // التعامل مع تغييرات حالة الشبكة
  const handleNetworkChange = useCallback(async () => {
    const isOnline = navigator.onLine;
    setIsOffline(!isOnline);
    
    if (isOnline) {
      // تجنب إجراء الكثير من الفحوصات المتكررة
      const now = Date.now();
      if (now - lastCheckTime < 10000) {
        console.log('تم التحقق من حالة الشبكة مؤخرًا، تخطي هذا الفحص');
        return networkStatus;
      }
      
      setLastCheckTime(now);
      
      // عند استعادة الاتصال، تحقق من مشاكل الاتصال المحتملة
      const status = await checkConnectivityIssues();
      setNetworkStatus(status);
      
      if (status.hasInternet) {
        toast({
          title: "تم استعادة الاتصال",
          description: status.hasServerAccess 
            ? "جاري تحديث البيانات من المصادر المتاحة..." 
            : "تم استعادة الاتصال المحلي فقط. سيتم الاعتماد على البيانات المخزنة.",
          duration: 4000,
        });
      }
    } else {
      // عند فقدان الاتصال، نعيّن حالة الشبكة على الفور
      const offlineStatus = { hasInternet: false, hasServerAccess: false };
      setNetworkStatus(offlineStatus);
      
      toast({
        title: "انقطع الاتصال",
        description: "أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
        variant: "destructive",
        duration: 5000,
      });
      
      return offlineStatus;
    }
    
    return networkStatus;
  }, [toast, networkStatus, lastCheckTime]);
  
  // التحقق من حالة الشبكة
  const checkNetworkStatus = useCallback(async () => {
    try {
      console.log('التحقق من حالة الشبكة والوصول إلى الخادم...');
      
      // تجنب إجراء الكثير من الفحوصات المتكررة
      const now = Date.now();
      if (now - lastCheckTime < 30000) {
        console.log('تم التحقق من حالة الشبكة مؤخرًا، استخدام النتائج المخزنة مؤقتًا');
        return networkStatus;
      }
      
      setLastCheckTime(now);
      
      const status = await checkConnectivityIssues();
      console.log('نتائج فحص الشبكة:', status);
      setNetworkStatus(status);
      return status;
    } catch (error) {
      console.error('خطأ في فحص حالة الشبكة:', error);
      const fallbackStatus = { hasInternet: navigator.onLine, hasServerAccess: false };
      setNetworkStatus(fallbackStatus);
      return fallbackStatus;
    }
  }, [networkStatus, lastCheckTime]);
  
  // إضافة استمعات لتغييرات حالة الشبكة
  useEffect(() => {
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // التحقق من حالة الشبكة عند التحميل
    handleNetworkChange();
    
    // إعداد فحص دوري لحالة الشبكة (كل 5 دقائق)
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkNetworkStatus();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      clearInterval(intervalId);
    };
  }, [handleNetworkChange, checkNetworkStatus]);
  
  return { isOffline, networkStatus, handleNetworkChange, checkNetworkStatus };
};
