
import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff,
  SignalHigh,
  SignalLow,
  Server, 
  ServerOff,
  AlertCircle,
  RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';

interface NetworkStatusBarProps {
  className?: string;
  onRefresh?: () => void;
  compact?: boolean;
}

const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({
  className,
  onRefresh,
  compact = false
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverAccess, setServerAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  // Check connectivity status
  const checkStatus = async () => {
    // Prevent frequent checks
    const now = Date.now();
    if (isChecking || (now - lastCheckTime < 3000)) {
      return;
    }

    setIsChecking(true);
    setLastCheckTime(now);

    try {
      const status = await checkConnectivityIssues();
      setIsOnline(status.hasInternet);
      setServerAccess(status.hasServerAccess);
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error);
      setServerAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Initial check on mount
  React.useEffect(() => {
    const handleOnlineChange = () => {
      setIsOnline(navigator.onLine);
      
      // Check server access when coming back online
      if (navigator.onLine) {
        setTimeout(checkStatus, 1000);
      } else {
        setServerAccess(false);
      }
    };

    // Set up event listeners
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    
    // Initial check
    checkStatus();
    
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    checkStatus();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Get the appropriate status icon
  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
    }
    
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-destructive animate-pulse" />;
    }
    
    if (serverAccess === false) {
      return <ServerOff className="h-4 w-4 text-amber-500" />;
    }

    if (serverAccess === true) {
      return <SignalHigh className="h-4 w-4 text-green-500" />;
    }
    
    return <SignalLow className="h-4 w-4 text-amber-500" />;
  };

  // Get status text
  const getStatusText = () => {
    if (isChecking) {
      return "جاري فحص الاتصال...";
    }
    
    if (!isOnline) {
      return "غير متصل بالإنترنت";
    }
    
    if (serverAccess === false) {
      return "متصل بالإنترنت فقط";
    }
    
    if (serverAccess === true) {
      return "متصل بالكامل";
    }
    
    return "جاري التحقق...";
  };

  // Get status color
  const getStatusColor = () => {
    if (!isOnline) return "text-destructive";
    if (serverAccess === false) return "text-amber-500";
    if (serverAccess === true) return "text-green-500";
    return "text-muted-foreground";
  };

  // Handle refresh animation
  const refreshIconClass = isChecking ? "animate-spin" : "";

  // Compact and expanded versions of the component
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              {getStatusIcon()}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleRefresh}
                disabled={isChecking}
              >
                <RefreshCw className={cn("h-3 w-3", refreshIconClass)} />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
            {serverAccess === false && (
              <p className="text-xs text-amber-500">البيانات قد تكون غير محدثة</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-card-foreground shadow-sm", className)}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={cn("text-sm font-medium", getStatusColor())}>{getStatusText()}</span>
        
        {serverAccess === false && isOnline && (
          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
            البيانات المحلية
          </Badge>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 w-7 p-0" 
        onClick={handleRefresh}
        disabled={isChecking}
      >
        <RefreshCw className={cn("h-3.5 w-3.5", refreshIconClass)} />
      </Button>
    </div>
  );
};

export default NetworkStatusBar;
