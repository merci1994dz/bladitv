
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';

interface ConnectivityIndicatorProps {
  onRefresh?: () => void;
  className?: string;
}

const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({ 
  onRefresh,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [serverAccess, setServerAccess] = useState<boolean | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const checkConnectivity = async () => {
    if (isChecking) return; // منع الفحص المتزامن
    
    setIsChecking(true);
    try {
      // فحص حالة الاتصال العامة
      const connectivityStatus = await checkConnectivityIssues();
      setIsOnline(connectivityStatus.hasInternet);
      setServerAccess(connectivityStatus.hasServerAccess);
      
      if (connectivityStatus.hasInternet && connectivityStatus.hasServerAccess) {
        // محاولة الاتصال بالمصدر
        const source = await checkBladiInfoAvailability();
        setActiveSource(source);
        
        if (source) {
          setConsecutiveFailures(0); // إعادة تعيين عداد الفشل عند النجاح
        } else {
          incrementFailureCount();
        }
      } else {
        incrementFailureCount();
      }
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error);
      incrementFailureCount();
    } finally {
      setIsChecking(false);
    }
  };

  // زيادة عداد الفشل مع إظهار إشعارات مناسبة
  const incrementFailureCount = () => {
    setConsecutiveFailures(prev => {
      const newCount = prev + 1;
      
      // عرض إشعارات تصاعدية بناءً على عدد الفشل
      if (newCount === 3) {
        toast({
          title: "تعذر الاتصال بالمصادر",
          description: "تم تسجيل عدة محاولات فاشلة للاتصال بالخادم. سيتم استخدام البيانات المخزنة.",
          variant: "warning",
        });
      } else if (newCount === 5) {
        toast({
          title: "مشكلة مستمرة في الاتصال",
          description: "يبدو أن هناك مشكلة مستمرة في الاتصال بالخادم. تحقق من اتصالك بالإنترنت.",
          variant: "destructive",
        });
      }
      
      return newCount;
    });
  };

  useEffect(() => {
    const handleOnlineChange = () => {
      const isNowOnline = navigator.onLine;
      setIsOnline(isNowOnline);
      
      if (isNowOnline) {
        // تأخير بسيط لضمان استقرار الاتصال قبل الفحص
        setTimeout(() => {
          checkConnectivity();
        }, 1000);
      } else {
        setActiveSource(null);
        setServerAccess(false);
      }
    };

    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    
    // فحص الاتصال عند التحميل
    checkConnectivity();
    
    // فحص دوري كل دقيقة إذا كان هناك محاولات فاشلة
    const intervalId = setInterval(() => {
      if (consecutiveFailures > 0 && navigator.onLine) {
        checkConnectivity();
      }
    }, 60000);
    
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      clearInterval(intervalId);
    };
  }, [consecutiveFailures]);

  const handleRefreshClick = () => {
    checkConnectivity();
    if (onRefresh) onRefresh();
  };

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
    
    // تحديد نوع المصدر للعرض
    const isLocalSource = activeSource.startsWith('/');
    const isJsdelivr = activeSource.includes('jsdelivr');
    const isBladiTv = activeSource.includes('bladitv');
    
    if (isLocalSource) {
      statusText = "متصل (مصدر محلي)";
    } else if (isJsdelivr) {
      statusText = "متصل (CDN)";
    } else if (isBladiTv) {
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
