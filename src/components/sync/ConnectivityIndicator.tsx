
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity/connectivity-checker';

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

  const checkConnectivity = async () => {
    setIsChecking(true);
    try {
      // First check Supabase connectivity
      const { hasInternet, hasServerAccess } = await checkConnectivityIssues();
      setIsOnline(hasInternet);
      setServerAccess(hasServerAccess);
      
      // Then check external API sources if we have internet
      if (hasInternet) {
        const source = await checkBladiInfoAvailability();
        setActiveSource(source);
      } else {
        setActiveSource(null);
      }
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error);
      setServerAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const handleOnlineChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        checkConnectivity();
      } else {
        setServerAccess(false);
        setActiveSource(null);
      }
    };

    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    
    // فحص الاتصال عند التحميل
    checkConnectivity();
    
    // إعداد مؤقت للتحقق الدوري من الاتصال (كل 5 دقائق)
    const intervalId = setInterval(() => {
      if (navigator.onLine && !isChecking) {
        checkConnectivity();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      clearInterval(intervalId);
    };
  }, [isChecking]);

  const handleRefreshClick = () => {
    checkConnectivity();
    if (onRefresh) onRefresh();
  };

  // تحديد حالة الاتصال للعرض
  let statusIcon = <AlertCircle className="h-4 w-4 text-amber-500" />;
  let statusText = "جاري التحقق من الاتصال...";
  let statusColor = "text-amber-500";

  if (isChecking) {
    statusIcon = <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-amber-500 animate-spin" />;
  } else if (!isOnline) {
    statusIcon = <WifiOff className="h-4 w-4 text-red-500" />;
    statusText = "أنت غير متصل بالإنترنت";
    statusColor = "text-red-500";
  } else if (serverAccess === false) {
    statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
    statusText = "تعذر الاتصال بالخادم";
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
  } else {
    statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
    statusText = "تعذر الاتصال بالمصادر الخارجية";
    statusColor = "text-red-500";
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
              <Wifi className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>حالة الاتصال بمصادر البيانات</p>
          {activeSource && (
            <p className="text-xs opacity-80 max-w-52 truncate">
              المصدر: {activeSource}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            حالة الاتصال بالخادم: {serverAccess === true ? "متصل" : serverAccess === false ? "غير متصل" : "قيد التحقق"}
          </p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs underline"
            onClick={handleRefreshClick}
          >
            إعادة فحص الاتصال
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectivityIndicator;
