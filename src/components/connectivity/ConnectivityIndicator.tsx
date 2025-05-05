
import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  SignalHigh,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConnectivityContext } from './ConnectivityProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectivityIndicatorProps {
  onRefresh?: () => Promise<any> | void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({
  onRefresh,
  className,
  showLabel = false,
  size = 'md'
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    isOnline, 
    hasServerAccess, 
    isChecking, 
    connectionType,
    checkStatus,
    statusMessage
  } = useConnectivityContext();

  // تحسين: معالجة فحص الاتصال مع تحديث البيانات
  const handleCheckConnection = async () => {
    if (isRefreshing || isChecking) return;
    
    setIsRefreshing(true);
    
    try {
      // فحص حالة الاتصال
      await checkStatus();
      
      // استدعاء وظيفة التحديث الإضافية إذا وجدت
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // تحسين: تحديد حجم الأيقونات والأزرار بناءً على حجم المكون
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3.5 w-3.5';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  // تحسين: تحديد مؤشر الحالة بناءً على حالة الاتصال
  const getStatusIcon = () => {
    if (isChecking || isRefreshing) {
      return <RefreshCw className={`${getIconSize()} text-primary animate-spin`} />;
    }
    
    if (!isOnline) {
      return <WifiOff className={`${getIconSize()} text-destructive`} />;
    }
    
    if (connectionType === 'limited') {
      return <AlertTriangle className={`${getIconSize()} text-amber-500`} />;
    }
    
    if (connectionType === 'full') {
      return <SignalHigh className={`${getIconSize()} text-green-500`} />;
    }
    
    return <Wifi className={`${getIconSize()} text-muted-foreground`} />;
  };

  // تحسين: الحصول على لون مؤشر الحالة
  const getStatusColor = () => {
    if (!isOnline) return 'text-destructive';
    if (connectionType === 'limited') return 'text-amber-500';
    if (connectionType === 'full') return 'text-green-500';
    return 'text-muted-foreground';
  };

  // إنشاء مكون مبسط مع شرح حالة
  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCheckConnection}
              disabled={isRefreshing || isChecking}
              className={cn("h-8 w-8", className)}
            >
              {getStatusIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // إنشاء مكون كامل مع تسمية
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("flex items-center gap-1", getStatusColor())}>
        {getStatusIcon()}
        <span className={cn("text-sm font-medium", size === 'sm' ? 'text-xs' : '')}>
          {statusMessage}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCheckConnection}
        disabled={isRefreshing || isChecking}
        className="h-6 w-6 mr-1"
      >
        <RefreshCw className={cn("h-3 w-3", isRefreshing || isChecking ? "animate-spin" : "")} />
      </Button>
    </div>
  );
};

export default ConnectivityIndicator;
