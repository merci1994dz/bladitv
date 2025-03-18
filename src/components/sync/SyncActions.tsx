
import React from 'react';
import { 
  immediateRefresh, 
  clearPageCache, 
  forceDataRefresh 
} from '@/services/sync/forceRefresh';
import { toast } from '@/hooks/use-toast';
import SyncActionsButtons from './SyncActionsButtons';

interface SyncActionsProps {
  isSyncing: boolean;
  isForceSyncing: boolean;
  networkStatus: {
    hasInternet: boolean;
    hasServerAccess?: boolean;
  };
  runSync: () => void;
  runForceSync: () => void;
  setCacheCleared: (cleared: boolean) => void;
  toggleAdvanced: () => void;
  showAdvanced: boolean;
}

const SyncActions: React.FC<SyncActionsProps> = ({
  isSyncing,
  isForceSyncing,
  networkStatus,
  runSync,
  runForceSync,
  setCacheCleared,
  toggleAdvanced,
  showAdvanced
}) => {
  // معالجة نقر زر المزامنة
  const handleSyncClick = () => {
    if (isSyncing || isForceSyncing) return;
    
    toast({
      title: "جاري المزامنة",
      description: "جاري تحديث البيانات من المصادر المتاحة...",
      duration: 3000,
    });
    
    runSync();
  };

  // معالجة نقر زر تحديث البيانات
  const handleForceDataRefresh = async () => {
    toast({
      title: "جاري تحديث البيانات",
      description: "جاري تحديث البيانات مع منع التخزين المؤقت...",
      duration: 3000,
    });
    
    await forceDataRefresh();
    runForceSync();
  };

  // معالجة نقر زر تحديث الصفحة
  const handleForceRefresh = () => {
    toast({
      title: "جاري تحديث الصفحة",
      description: "جاري مسح التخزين المؤقت وإعادة تحميل الصفحة...",
      duration: 2000,
    });
    
    // تنفيذ تحديث فوري مع مسح التخزين المؤقت
    setTimeout(() => {
      immediateRefresh();
    }, 1000);
  };

  // معالجة مسح التخزين المؤقت
  const handleClearCache = async () => {
    toast({
      title: "جاري مسح التخزين المؤقت",
      description: "جاري مسح جميع بيانات التخزين المؤقت...",
      duration: 2000,
    });
    
    const result = await clearPageCache();
    setCacheCleared(result);
    
    toast({
      title: result ? "تم مسح التخزين المؤقت" : "فشل مسح التخزين المؤقت",
      description: result ? "تم مسح التخزين المؤقت بنجاح" : "حدث خطأ أثناء مسح التخزين المؤقت",
      duration: 3000,
    });
  };

  return (
    <SyncActionsButtons
      isSyncing={isSyncing}
      isForceSyncing={isForceSyncing}
      networkStatus={networkStatus}
      handleSyncClick={handleSyncClick}
      handleForceDataRefresh={handleForceDataRefresh}
      handleForceRefresh={handleForceRefresh}
      handleClearCache={handleClearCache}
      toggleAdvanced={toggleAdvanced}
      showAdvanced={showAdvanced}
    />
  );
};

export default SyncActions;
