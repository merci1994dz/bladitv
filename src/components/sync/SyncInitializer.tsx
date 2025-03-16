
import React, { useEffect } from 'react';
import { setupRealtimeSync, syncWithSupabase } from '@/services/sync/supabaseSync';
import { useAutoSync } from '@/hooks/useAutoSync';

interface SyncInitializerProps {
  children: React.ReactNode;
}

const SyncInitializer: React.FC<SyncInitializerProps> = ({ children }) => {
  const {
    checkSourceAvailability,
    initializeSupabase,
    performInitialSync,
    handleOnline,
    handleFocus
  } = useAutoSync();
  
  useEffect(() => {
    // Set up initial sync with delay to prevent conflicts
    const initialSyncTimeout = setTimeout(() => {
      console.log('بدء المزامنة الأولية في AutoSyncProvider');
      
      const initialize = async () => {
        await checkSourceAvailability();
        await initializeSupabase();
        await performInitialSync();
      };
      
      initialize();
    }, 3000);
    
    // Set up periodic sync every 5 minutes
    const syncInterval = setInterval(() => {
      console.log('تنفيذ المزامنة الدورية مع Supabase');
      syncWithSupabase(false);
      
      // Re-check available sources periodically
      checkSourceAvailability();
    }, 5 * 60 * 1000);
    
    // Set up online/offline listeners
    window.addEventListener('online', handleOnline);
    
    // Set up realtime subscription
    const unsubscribeRealtime = setupRealtimeSync();
    
    // Set up focus/blur listeners
    window.addEventListener('focus', handleFocus);
    
    // Clean up all listeners and timers
    return () => {
      clearTimeout(initialSyncTimeout);
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      unsubscribeRealtime();
    };
  }, [checkSourceAvailability, initializeSupabase, performInitialSync, handleOnline, handleFocus]);
  
  return <>{children}</>;
};

export default SyncInitializer;
