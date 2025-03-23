
import React from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useInitialSync } from '@/hooks/useInitialSync';
import SyncRetryHandler from './SyncRetryHandler';
import PeriodicSyncManager from './PeriodicSyncManager';

interface SyncInitializerProps {
  children: React.ReactNode;
}

/**
 * مكون يدير تهيئة المزامنة والاستماع للأحداث
 */
const SyncInitializer: React.FC<SyncInitializerProps> = ({ children }) => {
  const { handleOnline, handleFocus } = useAutoSync();
  
  const {
    syncAttemptsRef,
    maxRetryAttemptsRef,
    isMountedRef,
    performInitialSyncWithRetry,
    retryWithDelay,
    setupRealtimeSyncSubscription,
    setupPeriodicSync,
  } = useInitialSync();
  
  return (
    <>
      {/* إدارة محاولات المزامنة الأولية */}
      <SyncRetryHandler 
        onInitialSync={performInitialSyncWithRetry}
        onRetry={retryWithDelay}
        syncAttempts={syncAttemptsRef}
        maxRetryAttempts={maxRetryAttemptsRef}
        isMounted={isMountedRef}
      />
      
      {/* إدارة المزامنة الدورية ومراقبة الشبكة */}
      <PeriodicSyncManager 
        setupPeriodicSync={setupPeriodicSync}
        setupRealtimeSync={setupRealtimeSyncSubscription}
        handleOnline={handleOnline}
        handleFocus={handleFocus}
      />
      
      {/* عرض محتوى التطبيق */}
      {children}
    </>
  );
};

export default SyncInitializer;
