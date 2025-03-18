
import React from 'react';
import { Shield, Wifi, WifiOff, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert } from '@/components/ui/alert';

interface SyncStatusInfoProps {
  networkStatus: {
    hasInternet: boolean;
    hasServerAccess: boolean;
  };
  isChecking: boolean;
  lastSync?: string | null;
  lastSyncDuration?: number;
  formatLastSync?: (() => string) | undefined;
}

const SyncStatusInfo: React.FC<SyncStatusInfoProps> = ({
  networkStatus,
  isChecking,
  lastSync,
  lastSyncDuration,
  formatLastSync
}) => {
  if (!networkStatus.hasServerAccess) {
    return (
      <Alert className="mb-4" variant="destructive">
        <div className="flex items-center gap-2">
          <WifiOff className="h-5 w-5" />
          <span>تعذر الوصول للخادم - سيتم استخدام البيانات المخزنة محليًا</span>
        </div>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="flex items-center">
          {networkStatus.hasInternet ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <span className="mr-2">
            {networkStatus.hasInternet ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'}
          </span>
        </div>
        
        <div className="flex items-center">
          <Shield className={`h-5 w-5 ${networkStatus.hasServerAccess ? 'text-green-500' : 'text-red-500'}`} />
          <span className="mr-2">
            {networkStatus.hasServerAccess ? 'متصل بالخادم' : 'لا يمكن الوصول للخادم'}
          </span>
        </div>
        
        {isChecking && (
          <div className="animate-pulse text-muted-foreground">
            جاري فحص الاتصال...
          </div>
        )}
      </div>
      
      {lastSync && formatLastSync && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 ml-1" />
                <span>آخر مزامنة: {formatLastSync()}</span>
                {lastSyncDuration && lastSyncDuration > 0 && (
                  <span className="mr-2">({(lastSyncDuration / 1000).toFixed(1)} ثانية)</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>وقت آخر مزامنة ناجحة مع الخادم</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default SyncStatusInfo;
