
import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/sourceAvailability';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';

interface ConnectivityIndicatorProps {
  onRefresh?: () => void;
  className?: string;
}

const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({ 
  onRefresh,
  className = ''
}) => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [serverAccess, setServerAccess] = useState<boolean | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [prevConnectionStatus, setPrevConnectionStatus] = useState<boolean>(navigator.onLine);

  // تحسين وظيفة فحص الاتصال باستخدام useCallback
  const checkConnectivity = useCallback(async () => {
    // منع فحص متكرر سريع
    const now = Date.now();
    const minCheckInterval = 3000; // منع الفحص أكثر من مرة كل 3 ثوانٍ
    
    if (isChecking || (now - lastCheckTime < minCheckInterval)) {
      return;
    }
    
    setIsChecking(true);
    setLastCheckTime(now);
    
    try {
      // فحص حالة الاتصال العامة
      const connectivityStatus = await checkConnectivityIssues();
      
      // حفظ الحالة السابقة قبل التحديث
      const wasOffline = !isOnline || !serverAccess;
      
      setIsOnline(connectivityStatus.hasInternet);
      setServerAccess(connectivityStatus.hasServerAccess);
      
      if (connectivityStatus.hasInternet && connectivityStatus.hasServerAccess) {
        // محاولة الاتصال بالمصدر مع مهلة محددة
        const sourceCheckPromise = checkBladiInfoAvailability();
        const timeoutPromise = new Promise<string | null>((resolve) => {
          setTimeout(() => resolve(null), 5000);
        });
        
        const source = await Promise.race([sourceCheckPromise, timeoutPromise]);
        
        if (source) {
          setActiveSource(source);
          setConsecutiveFailures(0); // إعادة تعيين عداد الفشل عند النجاح
          
          // تم إلغاء إشعار استعادة الاتصال هنا
        } else {
          incrementFailureCount("لم يتم العثور على مصادر متاحة");
        }
      } else {
        incrementFailureCount(connectivityStatus.hasInternet 
          ? "تعذر الوصول إلى خوادم البيانات" 
          : "أنت غير متصل بالإنترنت");
      }
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error);
      incrementFailureCount("حدث خطأ أثناء فحص الاتصال");
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, lastCheckTime, consecutiveFailures, toast, isOnline, serverAccess]);

  // زيادة عداد الفشل مع إظهار إشعارات مناسبة
  const incrementFailureCount = useCallback((reason: string) => {
    setConsecutiveFailures(prev => {
      const newCount = prev + 1;
      
      // عرض إشعارات تصاعدية بناءً على عدد الفشل
      if (newCount === 3) {
        toast({
          title: "تعذر الاتصال بالمصادر",
          description: "سيتم استخدام البيانات المخزنة محليًا.",
          duration: 5000
        });
      } else if (newCount === 5) {
        toast({
          title: "مشكلة مستمرة في الاتصال",
          description: `${reason}. تحقق من اتصالك بالإنترنت.`,
          variant: "destructive",
          duration: 6000
        });
      }
      
      return newCount;
    });
  }, [toast]);

  // تحسين التعامل مع تغييرات حالة الشبكة
  useEffect(() => {
    const handleOnlineChange = () => {
      const isNowOnline = navigator.onLine;
      setPrevConnectionStatus(isOnline);
      setIsOnline(isNowOnline);
      
      if (isNowOnline) {
        // تأخير بسيط لضمان استقرار الاتصال قبل الفحص
        setTimeout(() => {
          checkConnectivity();
        }, 1500);
      } else {
        setActiveSource(null);
        setServerAccess(false);
        toast({
          title: "انقطع الاتصال",
          description: "سيتم استخدام البيانات المخزنة محليًا.",
          variant: "destructive",
          duration: 5000
        });
      }
    };

    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    
    // فحص الاتصال عند التحميل مع تأخير للسماح بتحميل التطبيق
    const initialCheckTimeout = setTimeout(() => {
      checkConnectivity();
    }, 2000);
    
    // فحص دوري باستراتيجية متكيفة
    const checkInterval = 60000; // كل دقيقة
    
    const intervalId = setInterval(() => {
      if (navigator.onLine && !isChecking) {
        checkConnectivity();
      }
    }, checkInterval);
    
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
    };
  }, [checkConnectivity, isChecking, toast, isOnline]);

  // تحسين معالج التحديث اليدوي
  const handleRefreshClick = useCallback(() => {
    if (!isChecking) {
      checkConnectivity();
      if (onRefresh) onRefresh();
    }
  }, [checkConnectivity, onRefresh, isChecking]);

  // تحديد حالة الاتصال للعرض
  let statusIcon = <AlertCircle className="h-4 w-4 text-amber-500" />;
  let statusText = "جاري التحقق من الاتصال...";
  let statusColor = "text-amber-500";

  if (isChecking) {
    statusIcon = <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />;
  } else if (!isOnline) {
    statusIcon = <WifiOff className="h-4 w-4 text-red-500" />;
    statusText = "أنت غير متصل بالإنترنت";
    statusColor = "text-red-500";
  } else if (activeSource) {
    statusIcon = <Wifi className="h-4 w-4 text-green-500" />;
    
    // تحديد نوع المصدر للعرض بطريقة أفضل
    if (activeSource.startsWith('/')) {
      statusText = "متصل (مصدر محلي)";
    } else if (activeSource.includes('jsdelivr')) {
      statusText = "متصل (CDN)";
    } else if (activeSource.includes('bladitv')) {
      statusText = "متصل (BladiTV)";
    } else {
      statusText = "متصل (مصدر خارجي)";
    }
    
    statusColor = "text-green-500";
  } else if (serverAccess === false) {
    statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
    statusText = "تعذر الوصول إلى الخوادم";
    statusColor = "text-red-500";
  } else {
    statusIcon = <AlertCircle className="h-4 w-4 text-amber-500" />;
    statusText = "مشكلة في الاتصال بالمصادر";
    statusColor = "text-amber-500";
  }

  // تحسين واجهة المستخدم
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <div className={`flex items-center gap-1 ${statusColor}`}>
              {statusIcon}
              <span className="text-xs">{statusText}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={handleRefreshClick}
              disabled={isChecking}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          <p className="font-medium">حالة الاتصال بمصادر البيانات</p>
          {activeSource && (
            <p className="text-xs opacity-80 max-w-52 truncate mt-1">
              المصدر: {activeSource}
            </p>
          )}
          {!activeSource && isOnline && (
            <p className="text-xs text-amber-500 mt-1">
              {serverAccess === false ? 
                "تعذر الوصول إلى خوادم البيانات. يتم استخدام البيانات المخزنة." : 
                "جاري محاولة الاتصال بالمصادر..."
              }
            </p>
          )}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs underline mt-2"
            onClick={handleRefreshClick}
            disabled={isChecking}
          >
            {isChecking ? "جاري الفحص..." : "إعادة فحص الاتصال"}
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectivityIndicator;
