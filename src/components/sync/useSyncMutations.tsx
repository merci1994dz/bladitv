
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { syncDataUnified } from '@/services/sync/core/unifiedSync';
import { forceDataRefresh } from '@/services/sync/forceRefresh';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/sourceAvailability';

export interface SyncMutationsProps {
  showNotification?: boolean;
  autoCheck?: boolean;
}

export const useSyncMutations = (options: SyncMutationsProps = {}) => {
  const { showNotification = true, autoCheck = false } = options;
  const [isSyncing, setIsSyncing] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<boolean | null>(null);
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const { toast } = useToast();

  // Check available sources on mount if autoCheck is enabled
  useEffect(() => {
    if (autoCheck) {
      checkAvailableSources();
    }
  }, [autoCheck]);

  /**
   * التحقق من المصادر المتاحة
   */
  const checkAvailableSources = async () => {
    try {
      const source = await checkBladiInfoAvailability();
      setAvailableSource(source);
      return source;
    } catch (error) {
      console.error("خطأ في التحقق من المصادر المتاحة:", error);
      setAvailableSource(null);
      return null;
    }
  };

  /**
   * تنفيذ المزامنة العادية
   */
  const runSync = async () => {
    if (isSyncing || isForceSyncing) return false;
    
    setIsSyncing(true);
    
    try {
      // التحقق من المصادر المتاحة أولاً
      const source = await checkAvailableSources();
      
      if (!source) {
        if (showNotification) {
          toast({
            title: "تحذير",
            description: "لا توجد مصادر متاحة. سيتم استخدام البيانات المخزنة محليًا.",
            variant: "destructive",
            duration: 5000,
          });
        }
        setLastSyncResult(false);
        return false;
      }
      
      if (showNotification) {
        toast({
          title: "جاري المزامنة",
          description: "جاري تحديث البيانات من المصادر المتاحة...",
          duration: 3000,
        });
      }
      
      const result = await syncDataUnified({
        forceRefresh: false,
        showNotifications: false
      });
      
      setLastSyncResult(result);
      
      if (result) {
        if (showNotification) {
          toast({
            title: "تمت المزامنة بنجاح",
            description: "تم تحديث البيانات بنجاح",
          });
        }
      } else {
        if (showNotification) {
          toast({
            title: "لا توجد تحديثات جديدة",
            description: "البيانات محدثة بالفعل",
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("خطأ أثناء المزامنة:", error);
      
      if (showNotification) {
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر الاتصال بمصادر البيانات",
          variant: "destructive"
        });
      }
      
      setLastSyncResult(false);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * تنفيذ مزامنة قوية مع منع التخزين المؤقت
   */
  const runForceSync = async () => {
    if (isSyncing || isForceSyncing) return false;
    
    setIsForceSyncing(true);
    
    try {
      // التحقق من حالة الاتصال أولاً
      const { hasInternet } = await checkConnectivityIssues();
      
      if (!hasInternet) {
        if (showNotification) {
          toast({
            title: "لا يوجد اتصال بالإنترنت",
            description: "تعذرت المزامنة. يرجى التحقق من اتصالك بالإنترنت.",
            variant: "destructive"
          });
        }
        return false;
      }
      
      // التحقق من المصادر المتاحة
      const source = await checkAvailableSources();
      
      if (!source) {
        if (showNotification) {
          toast({
            title: "تحذير",
            description: "لا توجد مصادر متاحة. سيتم استخدام البيانات المخزنة محليًا.",
            variant: "destructive",
            duration: 5000,
          });
        }
        setLastSyncResult(false);
        return false;
      }
      
      if (showNotification) {
        toast({
          title: "جاري تحديث البيانات",
          description: "جاري تحديث البيانات مع منع التخزين المؤقت...",
          duration: 3000,
        });
      }
      
      // مسح ذاكرة التخزين المؤقت
      await forceDataRefresh();
      
      const result = await syncDataUnified({
        forceRefresh: true,
        showNotifications: false
      });
      
      setLastSyncResult(result);
      
      if (result) {
        if (showNotification) {
          toast({
            title: "تم التحديث بنجاح",
            description: "تم تحديث البيانات بالكامل بنجاح",
          });
        }
      } else {
        if (showNotification) {
          toast({
            title: "تعذر التحديث",
            description: "تعذر الاتصال بمصادر البيانات",
            variant: "destructive"
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("خطأ أثناء التحديث القسري:", error);
      
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
  };

  return {
    isSyncing,
    isForceSyncing,
    lastSyncResult,
    availableSource,
    checkAvailableSources,
    runSync,
    runForceSync
  };
};

export default useSyncMutations;
