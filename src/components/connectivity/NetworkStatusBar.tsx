
import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnectivityContext } from './ConnectivityProvider';
import { cn } from '@/lib/utils';

interface NetworkStatusBarProps {
  compact?: boolean;
  onRefresh?: () => Promise<void>;
}

const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({ 
  compact = false,
  onRefresh 
}) => {
  const { isOnline, hasServerAccess, connectionType, isChecking } = useConnectivityContext();
  
  // اختيار الألوان والرسائل بناءً على نوع الاتصال
  const statusColor = 
    !isOnline ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400' :
    connectionType === 'limited' ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400' :
    'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400';

  const statusIcon = 
    !isOnline ? <WifiOff size={compact ? 14 : 16} /> :
    connectionType === 'limited' ? <Signal size={compact ? 14 : 16} /> :
    <Wifi size={compact ? 14 : 16} />;

  const statusMessage = 
    !isOnline ? 'غير متصل' : 
    connectionType === 'limited' ? 'اتصال محدود' : 
    'متصل';

  // في وضع الاختصار، نعرض مؤشرًا مصغرًا
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded text-xs border",
          statusColor
        )}
      >
        {statusIcon}
        <span>{statusMessage}</span>
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isChecking}
            className="h-5 w-5 p-0 ml-1"
          >
            <Signal className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // في الوضع العادي، نعرض شريط حالة كامل
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2 rounded border",
        statusColor
      )}
    >
      <div className="flex items-center gap-2">
        {statusIcon}
        <div>
          <div className="font-medium">{statusMessage}</div>
          <div className="text-xs opacity-80">
            {!isOnline ? 'تحقق من اتصال الإنترنت' : 
             connectionType === 'limited' ? 'متصل بالإنترنت لكن تعذر الوصول إلى المصادر' : 
             'متصل بالإنترنت وبالمصادر'}
          </div>
        </div>
      </div>
      
      {onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isChecking}
        >
          <Signal className={`h-4 w-4 mr-1 ${isChecking ? "animate-spin" : ""}`} />
          تحقق
        </Button>
      )}
    </div>
  );
};

export default NetworkStatusBar;
