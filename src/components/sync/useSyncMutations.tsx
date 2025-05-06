
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { syncDataUnified } from '@/services/sync/core/unifiedSync';
import { forceDataRefresh } from '@/services/sync/forceRefresh';
import { checkConnectivityIssues } from '@/services/sync/status/connectivity';

export interface SyncMutationsProps {
  showNotification?: boolean;
}

export const useSyncMutations = (options: SyncMutationsProps = {}) => {
  const { showNotification = true } = options;
  const [isSyncing, setIsSyncing] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  /**
   * تنفيذ المزامنة العادية
   */
  const runSync = async () => {
    if (isSyncing || isForceSyncing) return false;
    
    setIsSyncing(true);
    
    try {
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
    runSync,
    runForceSync
  };
};

export default useSyncMutations;
