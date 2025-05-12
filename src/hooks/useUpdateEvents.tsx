
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAutoSync } from '@/hooks/useAutoSync';

export const useUpdateEvents = () => {
  const { resetSyncError } = useAutoSync();
  const { toast } = useToast();
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  
  // Handle channel update events - with reduced notifications
  const handleChannelsUpdate = useCallback((e: CustomEvent) => {
    const { timestamp, source } = e.detail || {};
    console.log('تم استلام إشعار بتحديث القنوات:', { timestamp, source });
    
    setLastUpdateTime(new Date().toLocaleString());
    
    // Only reload the page, don't show notification
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);
  
  // Handle storage changes
  const handleStorageChange = useCallback((e: StorageEvent) => {
    const forceRefreshKeys = [
      'force_browser_refresh',
      'bladi_force_refresh',
      'force_update',
      'force_reload_all'
    ];
    
    if (e.key && forceRefreshKeys.includes(e.key) && e.newValue === 'true') {
      console.log('تم اكتشاف طلب تحديث من مصدر خارجي:', e.key);
      
      // Don't show notification, just reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, []);
  
  // Add event listeners
  useEffect(() => {
    window.addEventListener('channels_updated', handleChannelsUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('channels_updated', handleChannelsUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleChannelsUpdate, handleStorageChange]);
  
  return { lastUpdateTime };
};
