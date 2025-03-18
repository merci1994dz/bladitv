import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues, quickConnectivityCheck } from '@/services/sync/status/connectivity/connectivity-checker';

export const useNetworkStatus = () => {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [networkStatus, setNetworkStatus] = useState<{
    hasInternet: boolean;
    hasServerAccess: boolean;
  }>({ hasInternet: navigator.onLine, hasServerAccess: false });
  
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const handleNetworkChange = useCallback(async () => {
    if (isChecking) return navigator.onLine;
    
    setIsChecking(true);
    const isOnline = navigator.onLine;
    setIsOffline(!isOnline);
    
    if (!isOnline) {
      setNetworkStatus({ hasInternet: false, hasServerAccess: false });
      toast({
        title: "انقطع الاتصال",
        description: "أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
        variant: "destructive",
        duration: 5000,
      });
      setCheckAttempts(0);
      setIsChecking(false);
      return false;
    }
    
    const currentTime = Date.now();
    const shouldDoFullCheck = isOnline && 
      (currentTime - lastCheckTime > 30000 || checkAttempts < 2);
    
    if (shouldDoFullCheck) {
      try {
        setLastCheckTime(currentTime);
        setCheckAttempts(prev => prev + 1);
        
        const quickCheck = await quickConnectivityCheck();
        
        if (!quickCheck) {
          setNetworkStatus({ hasInternet: true, hasServerAccess: false });
          setIsChecking(false);
          return isOnline;
        }
        
        const status = await checkConnectivityIssues();
        setNetworkStatus(status);
        
        if (status.hasInternet && status.hasServerAccess && !networkStatus.hasServerAccess) {
          toast({
            title: "تم استعادة الاتصال",
            description: "جاري تحديث البيانات من المصادر المتاحة...",
            duration: 4000,
          });
        } else if (status.hasInternet && !status.hasServerAccess) {
          toast({
            title: "اتصال محدود",
            description: "يمكن الوصول للإنترنت ولكن ليس للخادم. سيتم الاعتماد على البيانات المخزنة.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('خطأ في فحص الشبكة:', error);
        setNetworkStatus({ hasInternet: isOnline, hasServerAccess: false });
      }
    }
    
    setIsChecking(false);
    return isOnline;
  }, [toast, checkAttempts, lastCheckTime, isChecking, networkStatus.hasServerAccess]);
  
  const retryConnection = useCallback(async () => {
    setCheckAttempts(0);
    return await handleNetworkChange();
  }, [handleNetworkChange]);
  
  useEffect(() => {
    const onlineHandler = () => handleNetworkChange();
    const offlineHandler = () => handleNetworkChange();
    
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    
    handleNetworkChange();
    
    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }, [handleNetworkChange]);
  
  return { 
    isOffline, 
    networkStatus, 
    handleNetworkChange, 
    retryConnection,
    isChecking
  };
};
