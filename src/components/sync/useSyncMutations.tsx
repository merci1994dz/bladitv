
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { syncDataUnified } from '@/services/sync/core/unifiedSync';
import { forceDataRefresh } from '@/services/sync/forceRefresh';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/sourceAvailability';

export interface SyncMutationsProps {
  showNotification?: boolean;
  autoCheck?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export const useSyncMutations = (options: SyncMutationsProps = {}) => {
  const { 
    showNotification = false, // Changed default to false to reduce notifications
    autoCheck = false, 
    retryOnFailure = true,
    maxRetries = 3
  } = options;
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<boolean | null>(null);
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Check available sources on mount if autoCheck is enabled
  useEffect(() => {
    if (autoCheck) {
      checkAvailableSources();
    }
    
    return () => {
      setRetryCount(0);
    };
  }, [autoCheck]);

  /**
   * التحقق من المصادر المتاحة
   */
  const checkAvailableSources = useCallback(async () => {
    try {
      const source = await checkBladiInfoAvailability();
      setAvailableSource(source);
      return source;
    } catch (error) {
      console.error("خطأ في التحقق من المصادر المتاحة:", error);
      setAvailableSource(null);
      return null;
    }
  }, []);

  /**
   * تنفيذ المزامنة العادية مع دعم إعادة المحاولة - تقليل الإشعارات
   */
  const runSync = useCallback(async () => {
    if (isSyncing || isForceSyncing) return false;
    
    setIsSyncing(true);
    setRetryCount(0);
    
    try {
      // Check available sources first
      const source = await checkAvailableSources();
      
      if (!source) {
        console.log("لا توجد مصادر متاحة. سيتم استخدام البيانات المخزنة محليًا.");
        setLastSyncResult(false);
        return false;
      }
      
      // Only show notification if explicitly requested
      if (showNotification) {
        toast({
          id: 'sync-auto', // Add ID for filtering
          title: "جاري المزامنة",
          description: "جاري تحديث البيانات من المصادر المتاحة...",
          duration: 1000, // Reduced duration
        });
      }
      
      const result = await syncDataUnified({
        forceRefresh: false,
        showNotifications: false // Never show notifications from sync itself
      });
      
      setLastSyncResult(result);
      
      // Only show completion notification if explicitly requested and there was an update
      if (showNotification && result) {
        toast({
          id: 'sync-success', // Add ID for filtering
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث البيانات بنجاح",
          duration: 1000, // Reduced duration
        });
      }
      
      return result;
    } catch (error) {
      console.error("خطأ أثناء المزامنة:", error);
      
      // Only show critical error notifications if explicitly requested
      if (showNotification && error instanceof Error && error.message.includes('critical')) {
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر الاتصال بمصادر البيانات",
          variant: "destructive"
        });
      }
      
      setLastSyncResult(false);
      
      // Retry if enabled and retry count is less than max
      if (retryOnFailure && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const retryDelay = Math.pow(2, retryCount) * 1000;
        
        // Don't show retry notifications
        setTimeout(() => {
          runSync();
        }, retryDelay);
      }
      
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isForceSyncing, showNotification, toast, checkAvailableSources, retryCount, maxRetries, retryOnFailure]);

  /**
   * تنفيذ مزامنة قوية مع منع التخزين المؤقت - تقليل الإشعارات
   */
  const runForceSync = useCallback(async () => {
    if (isSyncing || isForceSyncing) return false;
    
    setIsForceSyncing(true);
    setRetryCount(0);
    
    try {
      // Check connection status first
      const { hasInternet } = await checkConnectivityIssues();
      
      if (!hasInternet) {
        console.log("لا يوجد اتصال بالإنترنت، تعذرت المزامنة.");
        return false;
      }
      
      // Check available sources
      const source = await checkAvailableSources();
      
      if (!source) {
        console.log("لا توجد مصادر متاحة. سيتم استخدام البيانات المخزنة محليًا.");
        setLastSyncResult(false);
        return false;
      }
      
      // Only show notification if explicitly requested
      if (showNotification) {
        toast({
          id: 'force-sync', // Add ID for filtering
          title: "جاري تحديث البيانات",
          description: "جاري تحديث البيانات مع منع التخزين المؤقت...",
          duration: 2000,
        });
      }
      
      // Clear cache
      await forceDataRefresh();
      
      const result = await syncDataUnified({
        forceRefresh: true,
        showNotifications: false // Never show notifications from sync itself
      });
      
      setLastSyncResult(result);
      
      // Only show completion notification if explicitly requested and there was an update
      if (showNotification && result) {
        toast({
          id: 'force-sync-success', // Add ID for filtering
          title: "تم التحديث بنجاح",
          description: "تم تحديث البيانات بالكامل بنجاح",
          duration: 1000, // Reduced duration
        });
      }
      
      return result;
    } catch (error) {
      console.error("خطأ أثناء التحديث القسري:", error);
      
      // Only show critical error notifications if explicitly requested
      if (showNotification) {
        toast({
          title: "خطأ في التحديث",
          description: "حدث خطأ أثناء تحديث البيانات",
          variant: "destructive"
        });
      }
      
      setLastSyncResult(false);
      return false;
    } finally {
      setIsForceSyncing(false);
    }
  }, [isSyncing, isForceSyncing, showNotification, toast, checkAvailableSources]);

  return {
    isSyncing,
    isForceSyncing,
    lastSyncResult,
    availableSource,
    retryCount,
    maxRetries,
    checkAvailableSources,
    runSync,
    runForceSync
  };
};

export default useSyncMutations;
