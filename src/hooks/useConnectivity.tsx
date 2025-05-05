
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';

export interface ConnectivityStatus {
  isOnline: boolean;
  hasServerAccess: boolean;
  isChecking: boolean;
  lastCheckTime: number;
  connectionType: 'full' | 'limited' | 'none';
  statusMessage: string;
}

export const useConnectivity = (options?: {
  showNotifications?: boolean;
  checkInterval?: number;
  onStatusChange?: (status: ConnectivityStatus) => void;
}) => {
  const { 
    showNotifications = true, 
    checkInterval = 60000,
    onStatusChange 
  } = options || {};
  
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectivityStatus>({
    isOnline: navigator.onLine,
    hasServerAccess: false,
    isChecking: false,
    lastCheckTime: 0,
    connectionType: 'none',
    statusMessage: 'جاري التحقق من الاتصال...'
  });

  const updateStatus = useCallback((newStatus: Partial<ConnectivityStatus>) => {
    setStatus(prev => {
      const updated = { ...prev, ...newStatus };
      
      // Determine connection type based on status
      if (!updated.isOnline) {
        updated.connectionType = 'none';
        updated.statusMessage = 'غير متصل بالإنترنت';
      } else if (!updated.hasServerAccess) {
        updated.connectionType = 'limited';
        updated.statusMessage = 'اتصال محدود - لا يمكن الوصول إلى المصادر';
      } else {
        updated.connectionType = 'full';
        updated.statusMessage = 'متصل بالكامل';
      }
      
      // Trigger callback if provided
      if (onStatusChange && 
          (prev.isOnline !== updated.isOnline || 
           prev.hasServerAccess !== updated.hasServerAccess ||
           prev.connectionType !== updated.connectionType)) {
        onStatusChange(updated);
      }
      
      return updated;
    });
  }, [onStatusChange]);

  // Check connectivity status
  const checkStatus = useCallback(async () => {
    // Prevent frequent checks (3 second minimum between checks)
    const now = Date.now();
    if (status.isChecking || (now - status.lastCheckTime < 3000)) {
      return status;
    }

    updateStatus({ isChecking: true });

    try {
      const connectivityResult = await checkConnectivityIssues();
      
      const newStatus = {
        isOnline: connectivityResult.hasInternet,
        hasServerAccess: connectivityResult.hasServerAccess,
        isChecking: false,
        lastCheckTime: now
      };
      
      updateStatus(newStatus);
      return { ...status, ...newStatus };
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error);
      updateStatus({ 
        isChecking: false, 
        hasServerAccess: false,
        lastCheckTime: now 
      });
      return { ...status, hasServerAccess: false, isChecking: false, lastCheckTime: now };
    }
  }, [status, updateStatus]);

  // Show appropriate notifications when status changes
  useEffect(() => {
    if (!showNotifications) return;

    // Notify when going offline
    const previousConnection = localStorage.getItem('prev_connection_type');
    const currentConnection = status.connectionType;
    
    if (previousConnection && previousConnection !== currentConnection) {
      if (currentConnection === 'none') {
        toast({
          title: "انقطع الاتصال",
          description: "أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.",
          variant: "destructive",
          duration: 5000,
        });
      } else if (currentConnection === 'limited' && previousConnection === 'none') {
        toast({
          title: "تم استعادة الاتصال",
          description: "تم استعادة الاتصال المحلي فقط. سيتم الاعتماد على البيانات المخزنة.",
          duration: 4000,
        });
      } else if (currentConnection === 'full' && (previousConnection === 'none' || previousConnection === 'limited')) {
        toast({
          title: "تم استعادة الاتصال",
          description: "تم استعادة الاتصال بالكامل. جاري تحديث البيانات من المصادر المتاحة...",
          duration: 4000,
        });
      }
    }
    
    localStorage.setItem('prev_connection_type', currentConnection);
  }, [status.connectionType, showNotifications, toast]);

  // Set up event listeners and periodic checks
  useEffect(() => {
    const handleOnlineChange = () => {
      updateStatus({ isOnline: navigator.onLine });
      
      if (navigator.onLine) {
        // Check server access after a short delay to ensure stable connection
        setTimeout(() => checkStatus(), 1500);
      } else {
        updateStatus({ hasServerAccess: false });
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    
    // Initial check
    checkStatus();
    
    // Set up periodic check
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkStatus();
      }
    }, checkInterval);
    
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      clearInterval(intervalId);
    };
  }, [checkStatus, checkInterval, updateStatus]);

  return {
    ...status,
    checkStatus,
    isOffline: !status.isOnline
  };
};
