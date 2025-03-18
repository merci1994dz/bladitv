
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

  // التعامل مع تغييرات حالة الشبكة - مع حماية ضد الفحص المتكرر
  const handleNetworkChange = useCallback(async () => {
    // تجنب تشغيل عمليات فحص متعددة في نفس الوقت
    if (isChecking) return navigator.onLine;
    
    setIsChecking(true);
    const isOnline = navigator.onLine;
    setIsOffline(!isOnline);
    
    // تحقق مما إذا يجب إجراء فحص شامل (منع الفحص المتكرر خلال فترة قصيرة)
    const currentTime = Date.now();
    const shouldDoFullCheck = isOnline && 
      (currentTime - lastCheckTime > 30000 || checkAttempts < 2);
    
    if (shouldDoFullCheck) {
      try {
        setLastCheckTime(currentTime);
        setCheckAttempts(prev => prev + 1);
        
        // البدء بفحص سريع للاتصال
        const quickCheck = await quickConnectivityCheck();
        
        if (!quickCheck) {
          setNetworkStatus({ hasInternet: true, hasServerAccess: false });
          setIsChecking(false);
          return isOnline;
        }
        
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
        console.error('خطأ في فحص الشبكة:', error);
        // في حالة الفشل، نفترض أن لدينا اتصال أساسي فقط
        setNetworkStatus({ hasInternet: isOnline, hasServerAccess: false });
      }
    } else if (!isOnline) {
      toast({
        title: "انقطع الاتصال",
        description: "أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
        variant: "destructive",
        duration: 5000,
      });
      
      // إعادة تعيين عدد المحاولات عند انقطاع الاتصال
      setCheckAttempts(0);
      setNetworkStatus({ hasInternet: false, hasServerAccess: false });
    }
    
    setIsChecking(false);
    return isOnline;
  }, [toast, checkAttempts, lastCheckTime, isChecking]);
  
  // وظيفة لإعادة محاولة فحص الاتصال يدوياً
  const retryConnection = useCallback(async () => {
    // إعادة تعيين عداد المحاولات للسماح بإجراء فحص كامل
    setCheckAttempts(0);
    return await handleNetworkChange();
  }, [handleNetworkChange]);
  
  // إضافة استمعات لتغييرات حالة الشبكة
  useEffect(() => {
    const onlineHandler = () => handleNetworkChange();
    const offlineHandler = () => handleNetworkChange();
    
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    
    // التحقق من حالة الشبكة عند التحميل
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
