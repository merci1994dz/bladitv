
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';

export const useNetworkStatus = () => {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [networkStatus, setNetworkStatus] = useState<{
    hasInternet: boolean;
    hasServerAccess: boolean;
  }>({ hasInternet: navigator.onLine, hasServerAccess: false });
  const [isChecking, setIsChecking] = useState(false);

  // التعامل مع تغييرات حالة الشبكة بطريقة أكثر فعالية
  const handleNetworkChange = useCallback(async () => {
    // منع تنفيذ عمليات فحص متزامنة
    if (isChecking) return navigator.onLine;
    
    setIsChecking(true);
    const isOnline = navigator.onLine;
    setIsOffline(!isOnline);
    
    if (isOnline) {
      try {
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
      } catch (error) {
        console.error("خطأ في التحقق من حالة الاتصال:", error);
        setNetworkStatus({ hasInternet: isOnline, hasServerAccess: false });
      }
    } else {
      toast({
        title: "انقطع الاتصال",
        description: "أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
        variant: "destructive",
        duration: 5000,
      });
      setNetworkStatus({ hasInternet: false, hasServerAccess: false });
    }
    
    setIsChecking(false);
    return isOnline;
  }, [toast, isChecking]);
  
  // إضافة استمعات لتغييرات حالة الشبكة وتحسين استجابة التطبيق
  useEffect(() => {
    const onlineHandler = () => handleNetworkChange();
    const offlineHandler = () => handleNetworkChange();
    
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    
    // التحقق من حالة الشبكة عند التحميل، مع تأخير بسيط لضمان استقرار التطبيق
    const initialCheckTimeout = setTimeout(() => {
      handleNetworkChange();
    }, 1000);
    
    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      clearTimeout(initialCheckTimeout);
    };
  }, [handleNetworkChange]);
  
  // إضافة وظيفة للتحقق الفوري من حالة الاتصال عند الطلب
  const checkConnection = useCallback(async () => {
    return await handleNetworkChange();
  }, [handleNetworkChange]);
  
  return { 
    isOffline, 
    networkStatus, 
    checkConnection,
    isCheckingConnection: isChecking
  };
};
