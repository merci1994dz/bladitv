
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/bladiInfoSync';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';

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
  const [isVercel, setIsVercel] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  useEffect(() => {
    // التحقق من بيئة النشر
    setIsVercel(isRunningOnVercel());
  }, []);

  const checkConnectivity = async () => {
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
      setIsOnline(connectivityStatus.hasInternet);
      setServerAccess(connectivityStatus.hasServerAccess);
      
      if (connectivityStatus.hasInternet && connectivityStatus.hasServerAccess) {
        // محاولة الاتصال بالمصدر
        const source = await checkBladiInfoAvailability();
        
        if (source) {
          setActiveSource(source);
          setConsecutiveFailures(0); // إعادة تعيين عداد الفشل عند النجاح
          
          // إذا كان المستخدم يواجه مشاكل في الاتصال سابقًا وتم حلها الآن
          if (consecutiveFailures > 2) {
            toast({
              title: "تم استعادة الاتصال بالمصادر",
              description: "تم استعادة الاتصال بمصادر البيانات بنجاح.",
              variant: "default",
              duration: 3000
            });
          }
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
  };

  // زيادة عداد الفشل مع إظهار إشعارات مناسبة
  const incrementFailureCount = (reason: string) => {
    setConsecutiveFailures(prev => {
      const newCount = prev + 1;
      
      // عرض إشعارات تصاعدية بناءً على عدد الفشل
      if (newCount === 3) {
        toast({
          title: "تعذر الاتصال بالمصادر",
          description: "تم تسجيل عدة محاولات فاشلة للاتصال بالخادم. سيتم استخدام البيانات المخزنة.",
          variant: "default",
          duration: 6000
        });
      } else if (newCount === 5) {
        toast({
          title: "مشكلة مستمرة في الاتصال",
          description: `${reason}. تحقق من اتصالك بالإنترنت.`,
          variant: "destructive",
          duration: 8000
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
        }, 1500);
      } else {
        setActiveSource(null);
        setServerAccess(false);
        toast({
          title: "انقطع الاتصال",
          description: "أنت غير متصل بالإنترنت. سيتم استخدام البيانات المخزنة محليًا.",
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
    
    // فحص دوري
    // تقليل الفترة على Vercel لتحسين التجربة
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkConnectivity();
      }
    }, isVercel ? 45000 : 60000); // كل 45 ثانية على Vercel، كل دقيقة على المنصات الأخرى
    
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
    };
  }, [consecutiveFailures, isVercel, toast]);

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
    const isVercelSource = activeSource.includes('vercel.app');
    
    if (isLocalSource) {
      statusText = "متصل (مصدر محلي)";
    } else if (isJsdelivr) {
      statusText = "متصل (CDN)";
    } else if (isBladiTv) {
      statusText = "متصل (BladiTV)";
    } else if (isVercelSource) {
      statusText = "متصل (Vercel)";
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
          {isVercel && (
            <p className="text-xs text-green-500 mt-1">
              يعمل التطبيق على Vercel
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
