
import React from 'react';
import { 
  Globe, 
  AlertTriangle, 
  Server, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface SyncStatusIndicatorsProps {
  networkStatus: {
    hasInternet: boolean;
    hasServerAccess: boolean;
  };
  syncError: string | null;
  cacheCleared: boolean;
  deploymentPlatform: string;
  isSyncing?: boolean;
  lastSyncDuration?: number;
}

export const SyncStatusIndicators: React.FC<SyncStatusIndicatorsProps> = ({
  networkStatus,
  syncError,
  cacheCleared,
  deploymentPlatform,
  isSyncing = false,
  lastSyncDuration = 0
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {/* Internet connection indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Globe 
                className={`h-4 w-4 ${
                  networkStatus.hasInternet 
                    ? 'text-green-500'
                    : 'text-red-500 animate-pulse'
                }`} 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {networkStatus.hasInternet 
                ? 'متصل بالإنترنت'
                : 'غير متصل بالإنترنت'}
            </p>
          </TooltipContent>
        </Tooltip>
        
        {/* Server connection indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Server 
                className={`h-4 w-4 ${
                  networkStatus.hasServerAccess
                    ? 'text-green-500'
                    : 'text-amber-500'
                }`} 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {networkStatus.hasServerAccess
                ? 'متصل بالخادم'
                : 'غير متصل بالخادم - سيتم استخدام البيانات المخزنة محليًا'}
            </p>
          </TooltipContent>
        </Tooltip>
        
        {/* Sync status indicator - NEW */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {isSyncing ? (
                <Clock className="h-4 w-4 text-blue-500 animate-spin" />
              ) : (
                <CheckCircle 
                  className={`h-4 w-4 ${
                    syncError
                      ? 'text-red-500'
                      : cacheCleared
                        ? 'text-amber-500'
                        : 'text-green-500'
                  }`} 
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {isSyncing 
                ? 'جاري المزامنة...'
                : syncError
                  ? 'فشلت المزامنة'
                  : cacheCleared
                    ? 'تم مسح ذاكرة التخزين المؤقت'
                    : 'تم المزامنة بنجاح'}
            </p>
            {lastSyncDuration > 0 && !isSyncing && (
              <p className="text-xs text-muted-foreground">
                استغرقت آخر مزامنة {(lastSyncDuration / 1000).toFixed(1)} ثانية
              </p>
            )}
          </TooltipContent>
        </Tooltip>
        
        {/* Error indicator */}
        {syncError && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">خطأ في المزامنة</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs max-w-[200px] truncate">{syncError}</p>
              )}
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Platform indicator */}
        <Badge 
          variant="outline" 
          className="h-5 text-xs bg-background"
        >
          {deploymentPlatform}
        </Badge>
      </div>
    </TooltipProvider>
  );
};
