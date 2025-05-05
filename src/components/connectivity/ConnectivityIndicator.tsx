
import React from 'react';
import { 
  SignalHigh, 
  SignalLow, 
  WifiOff, 
  RefreshCw, 
  ServerOff 
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useConnectivity } from '@/hooks/useConnectivity';

interface ConnectivityIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showRefreshButton?: boolean;
  showLabel?: boolean;
  onRefresh?: () => void;
}

const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({
  className,
  size = 'md',
  showRefreshButton = true,
  showLabel = true,
  onRefresh
}) => {
  const { 
    isOnline, 
    hasServerAccess, 
    isChecking, 
    checkStatus, 
    connectionType, 
    statusMessage 
  } = useConnectivity();
  
  // Handle status icon and color
  const getConnectionIcon = () => {
    if (isChecking) {
      return <RefreshCw className={iconSize} />;
    }
    
    if (!isOnline) {
      return <WifiOff className={iconSize} />;
    }
    
    if (!hasServerAccess) {
      return <ServerOff className={iconSize} />;
    }
    
    return connectionType === 'full' 
      ? <SignalHigh className={iconSize} /> 
      : <SignalLow className={iconSize} />;
  };
  
  const getStatusColor = () => {
    if (isChecking) return "text-amber-500";
    if (!isOnline) return "text-destructive";
    if (!hasServerAccess) return "text-amber-500";
    return "text-green-500";
  };
  
  // Determine icon size based on prop
  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }[size];
  
  // Handle refresh click
  const handleRefreshClick = () => {
    checkStatus();
    if (onRefresh) onRefresh();
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", className)}>
            <div className={cn("flex items-center gap-1", getStatusColor())}>
              {getConnectionIcon()}
              
              {showLabel && (
                <span className={cn("text-xs font-medium", {
                  "hidden sm:block": size === 'sm'
                })}>
                  {statusMessage}
                </span>
              )}
              
              {connectionType === 'limited' && (
                <Badge variant="outline" className="h-5 text-xs bg-background hidden sm:flex">
                  بيانات محلية
                </Badge>
              )}
            </div>
            
            {showRefreshButton && (
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", {
                  "h-5 w-5": size === 'sm',
                  "h-6 w-6": size === 'md',
                  "h-7 w-7": size === 'lg'
                })}
                onClick={handleRefreshClick}
                disabled={isChecking}
              >
                <RefreshCw className={cn(iconSize, isChecking ? "animate-spin" : "")} />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">حالة الاتصال</p>
            
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1">
                <span className={isOnline ? "text-green-500" : "text-destructive"}>
                  {isOnline ? "متصل بالإنترنت" : "غير متصل بالإنترنت"}
                </span>
              </div>
              
              {isOnline && (
                <div className="flex items-center gap-1">
                  <span className={hasServerAccess ? "text-green-500" : "text-amber-500"}>
                    {hasServerAccess 
                      ? "يمكن الوصول إلى المصادر" 
                      : "لا يمكن الوصول إلى المصادر - تستخدم البيانات المحلية"}
                  </span>
                </div>
              )}
            </div>
            
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs underline mt-2"
              onClick={handleRefreshClick}
              disabled={isChecking}
            >
              {isChecking ? "جاري الفحص..." : "إعادة فحص الاتصال"}
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectivityIndicator;
