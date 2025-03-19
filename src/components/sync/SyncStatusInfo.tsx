
import React from 'react';
import { SyncInfoDisplay } from './SyncInfoDisplay';
import { SyncStatusIndicators } from './SyncStatusIndicators';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SyncStatusInfoProps {
  lastSync: string | null;
  formatLastSync: () => string;
  networkStatus: {
    hasInternet: boolean;
    hasServerAccess: boolean;
  };
  syncError: string | null;
  cacheCleared: boolean;
  deploymentPlatform: string;
  isSyncing?: boolean;
  lastSyncDuration?: number;
  syncQueryError?: Error | null;
}

const SyncStatusInfo: React.FC<SyncStatusInfoProps> = ({
  lastSync,
  formatLastSync,
  networkStatus,
  syncError,
  cacheCleared,
  deploymentPlatform,
  isSyncing = false,
  lastSyncDuration = 0,
  syncQueryError = null
}) => {
  // عرض رسالة خطأ إذا تعذر الوصول إلى الخادم
  const showServerConnectionError = syncQueryError || (!networkStatus.hasServerAccess && networkStatus.hasInternet);

  return (
    <>
      {showServerConnectionError && (
        <Alert variant="default" className="mb-4 animate-in fade-in-50 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>تعذر الوصول إلى الخادم</AlertTitle>
          <AlertDescription>
            لا يمكن الوصول إلى خادم البيانات حالياً. سيتم استخدام البيانات المخزنة محلياً.
            {!networkStatus.hasInternet && (
              <div className="mt-1 text-sm">
                تحقق من اتصالك بالإنترنت وحاول مرة أخرى.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <SyncInfoDisplay 
          lastSync={lastSync} 
          formatLastSync={formatLastSync} 
        />
        
        <SyncStatusIndicators 
          networkStatus={networkStatus} 
          syncError={syncError} 
          cacheCleared={cacheCleared}
          deploymentPlatform={deploymentPlatform}
          isSyncing={isSyncing}
          lastSyncDuration={lastSyncDuration}
        />
      </div>
    </>
  );
};

export default SyncStatusInfo;
