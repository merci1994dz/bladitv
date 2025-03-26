
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncDataUnified, getSyncStatus } from '@/services/sync/core/unifiedSync';
import { useToast } from '@/hooks/use-toast';

/**
 * خطاف React محسن للمزامنة
 * Optimized React hook for synchronization
 */
export const useSyncOptimized = (options: {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncSuccess?: () => void;
  onSyncError?: (error: Error) => void;
} = {}) => {
  const {
    autoSync = false,
    syncInterval = 300000, // 5 دقائق افتراضيًا
    onSyncSuccess,
    onSyncError
  } = options;
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // تحديث حالة المزامنة
  const updateSyncStatus = useCallback(() => {
    const status = getSyncStatus();
    if (status.lastSyncTime) {
      setLastSyncTime(status.lastSyncTime);
    }
  }, []);
  
  // تنفيذ المزامنة
  const performSync = useCallback(async (force: boolean = false) => {
    if (isSyncing) return false;
    
    setIsSyncing(true);
    try {
      const result = await syncDataUnified({
        forceRefresh: force,
        showNotifications: true
      });
      
      if (result) {
        // إبطال جميع الاستعلامات لإعادة تحميل البيانات
        queryClient.invalidateQueries();
        updateSyncStatus();
        onSyncSuccess?.();
      }
      
      return result;
    } catch (error) {
      console.error('خطأ في المزامنة المحسنة:', error);
      
      if (error instanceof Error) {
        onSyncError?.(error);
      }
      
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, queryClient, updateSyncStatus, onSyncSuccess, onSyncError]);
  
  // المزامنة الدورية
  useEffect(() => {
    updateSyncStatus();
    
    if (!autoSync) return;
    
    const intervalId = setInterval(() => {
      performSync(false).catch(console.error);
    }, syncInterval);
    
    return () => clearInterval(intervalId);
  }, [autoSync, syncInterval, performSync, updateSyncStatus]);
  
  // الاستماع لأحداث تحديث البيانات
  useEffect(() => {
    const handleDataUpdate = () => {
      updateSyncStatus();
      queryClient.invalidateQueries();
    };
    
    window.addEventListener('app_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);
    
    return () => {
      window.removeEventListener('app_data_updated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, [queryClient, updateSyncStatus]);
  
  // مزامنة عند العودة إلى التبويب
  useEffect(() => {
    const handleFocus = () => {
      // تأخير قصير لمنع المزامنة المتكررة
      setTimeout(() => {
        performSync(false).catch(console.error);
      }, 1000);
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [performSync]);
  
  return {
    isSyncing,
    lastSyncTime,
    syncNow: (force: boolean = true) => performSync(force),
    syncStatus: getSyncStatus
  };
};
