
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';

export interface ConnectivityStatus {
  hasInternet: boolean;
  hasServerAccess: boolean;
}

export type ConnectionType = 'full' | 'limited' | 'none';

interface UseConnectivityOptions {
  showNotifications?: boolean;
  checkInterval?: number;
  onStatusChange?: (status: ConnectivityStatus) => void;
}

export const useConnectivity = (options: UseConnectivityOptions = {}) => {
  const {
    showNotifications = false,
    checkInterval = 60000,
    onStatusChange
  } = options;

  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasServerAccess, setHasServerAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const [statusMessage, setStatusMessage] = useState('جاري التحقق من الاتصال...');
  const [networkStatus, setNetworkStatus] = useState<ConnectivityStatus>({
    hasInternet: navigator.onLine,
    hasServerAccess: false
  });

  // تحسين: وظيفة مزامنة للتحقق من حالة الاتصال
  const checkStatus = useCallback(async (): Promise<ConnectivityStatus> => {
    setIsChecking(true);
    
    try {
      const status = await checkConnectivityIssues();
      
      setIsOnline(status.hasInternet);
      setHasServerAccess(status.hasServerAccess);
      setLastCheckTime(Date.now());
      setNetworkStatus(status);
      
      // تحديد نوع الاتصال
      if (!status.hasInternet) {
        setConnectionType('none');
        setStatusMessage('غير متصل بالإنترنت');
      } else if (!status.hasServerAccess) {
        setConnectionType('limited');
        setStatusMessage('متصل بالإنترنت فقط');
      } else {
        setConnectionType('full');
        setStatusMessage('متصل بالكامل');
      }
      
      // إرسال الإشعارات إذا كان مطلوبًا
      if (showNotifications) {
        if (!status.hasInternet) {
          toast({
            title: "غير متصل بالإنترنت",
            description: "أنت في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
            variant: "destructive"
          });
        } else if (!status.hasServerAccess) {
          toast({
            title: "اتصال محدود",
            description: "متصل بالإنترنت لكن تعذر الوصول إلى مصادر البيانات. يتم عرض البيانات المخزنة محليًا.",
            variant: "default"
          });
        }
      }
      
      // استدعاء دالة رد الاتصال إذا وجدت
      if (onStatusChange) {
        onStatusChange(status);
      }
      
      return status;
    } catch (error) {
      console.error('خطأ في فحص حالة الاتصال:', error);
      setConnectionType('none');
      setStatusMessage('حدث خطأ في فحص الاتصال');
      
      const status = {
        hasInternet: navigator.onLine,
        hasServerAccess: false
      };
      
      setNetworkStatus(status);
      return status;
    } finally {
      setIsChecking(false);
    }
  }, [toast, showNotifications, onStatusChange]);

  // تحسين: فحص الاتصال عند تغيير حالة الشبكة
  const handleNetworkChange = useCallback(() => {
    const isCurrentlyOnline = navigator.onLine;
    setIsOnline(isCurrentlyOnline);
    
    if (isCurrentlyOnline !== isOnline) {
      checkStatus();
    }
  }, [isOnline, checkStatus]);

  // تحسين: إعداد مستمعي أحداث الشبكة
  useEffect(() => {
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // فحص أولي عند تحميل المكون
    checkStatus();
    
    // إنشاء فترة للفحص الدوري
    let intervalId: number;
    if (checkInterval > 0) {
      intervalId = window.setInterval(() => {
        // فحص الاتصال فقط إذا كان المتصفح متصلًا
        if (navigator.onLine) {
          checkStatus();
        }
      }, checkInterval);
    }
    
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [handleNetworkChange, checkStatus, checkInterval]);

  return {
    isOnline,
    isOffline: !isOnline,
    hasServerAccess,
    isChecking,
    lastCheckTime,
    connectionType,
    statusMessage,
    networkStatus,
    checkStatus
  };
};

export default useConnectivity;
