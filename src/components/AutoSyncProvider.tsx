
import React from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import SyncErrorNotification from './sync/SyncErrorNotification';
import AvailableSourceLogger from './sync/AvailableSourceLogger';
import SyncInitializer from './sync/SyncInitializer';

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

const AutoSyncProvider: React.FC<AutoSyncProviderProps> = ({ children }) => {
  const { syncError, availableSource } = useAutoSync();
  
  return (
    <>
      {/* Handle sync initialization and event listeners */}
      <SyncInitializer>
        {/* Display error notifications */}
        <SyncErrorNotification syncError={syncError} />
        
        {/* Log available sources in development */}
        <AvailableSourceLogger availableSource={availableSource} />
        
        {/* Render children */}
        {children}
      </SyncInitializer>
    </>
  );
};

export default AutoSyncProvider;
