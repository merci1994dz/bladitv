
import React from 'react';
import { SyncInfoDisplay } from './SyncInfoDisplay';
import { SyncStatusIndicators } from './SyncStatusIndicators';

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
}

const SyncStatusInfo: React.FC<SyncStatusInfoProps> = ({
  lastSync,
  formatLastSync,
  networkStatus,
  syncError,
  cacheCleared,
  deploymentPlatform
}) => {
  return (
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
      />
    </div>
  );
};

export default SyncStatusInfo;
