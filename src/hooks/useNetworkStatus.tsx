
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status';

export const useNetworkStatus = () => {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [networkStatus, setNetworkStatus] = useState<{
    hasInternet: boolean;
    hasServerAccess: boolean;
  }>({ hasInternet: navigator.onLine, hasServerAccess: false });

  // التعامل مع تغييرات حالة الشبكة
  const handleNetworkChange = useCallback(async () => {
    const isOnline = navigator.onLine;
    setIsOffline(!isOnline);
    
    if (isOnline) {
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
      toast({
        title: "انقطع الاتصال",
        description: "أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    return isOnline;
  }, [toast]);
  
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
  
  return { isOffline, networkStatus, handleNetworkChange };
};
