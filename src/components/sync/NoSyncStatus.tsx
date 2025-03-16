
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import SyncStatusIcon from './SyncStatusIcon';
import SyncButton from './SyncButton';

interface NoSyncStatusProps {
  runSync: () => void;
  isSyncing: boolean;
  isForceSyncing: boolean;
}

const NoSyncStatus: React.FC<NoSyncStatusProps> = ({ 
  runSync, 
  isSyncing, 
  isForceSyncing 
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <SyncStatusIcon noSync={true} isRecent={false} isVeryOld={false} />
        <span>لم تتم المزامنة بعد</span>
        <SyncButton
          onClick={runSync}
          isLoading={isSyncing || isForceSyncing}
          tooltipText="تحديث الآن"
        />
      </div>
    </TooltipProvider>
  );
};

export default NoSyncStatus;
