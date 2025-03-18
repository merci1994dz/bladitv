
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity/connectivity-checker';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface ConnectivityIndicatorProps {
  onRefresh?: () => void;
  className?: string;
}

const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({ 
  onRefresh,
  className = ''
}) => {
  const { isOffline, networkStatus, retryConnection, isChecking } = useNetworkStatus();
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const checkConnectivity = async () => {
    if (isChecking) return;
    
    try {
      await retryConnection();
      setLastCheckTime(new Date());
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error);
    }
  };

  useEffect(() => {
    // فحص الاتصال عند التحميل
    checkConnectivity();
    
    // إعداد فحص دوري كل 5 دقائق
    const intervalId = setInterval(() => {
      checkConnectivity();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
  } else if (isOffline) {
    statusIcon = <WifiOff className="h-4 w-4 text-red-500" />;
    statusText = "أنت غير متصل بالإنترنت";
    statusColor = "text-red-500";
  } else if (networkStatus.hasServerAccess) {
    statusIcon = <Wifi className="h-4 w-4 text-green-500" />;
    statusText = "متصل بالخادم";
    statusColor = "text-green-500";
  } else if (networkStatus.hasInternet) {
    statusIcon = <AlertCircle className="h-4 w-4 text-amber-500" />;
    statusText = "متصل محدود (لا يمكن الوصول للخادم)";
    statusColor = "text-amber-500";
  } else {
    statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
    statusText = "تعذر الاتصال بالخادم";
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
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>حالة الاتصال بمصادر البيانات</p>
          {lastCheckTime && (
            <p className="text-xs opacity-80">
              آخر فحص: {lastCheckTime.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs underline"
            onClick={handleRefreshClick}
            disabled={isChecking}
          >
            {isChecking ? 'جاري الفحص...' : 'إعادة فحص الاتصال'}
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectivityIndicator;
