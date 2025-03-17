
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAutoSync } from '@/hooks/useAutoSync';

export const useUpdateEvents = () => {
  const { resetSyncError } = useAutoSync();
  const { toast } = useToast();
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  
  // معالجة أحداث تحديث القنوات
  const handleChannelsUpdate = useCallback((e: CustomEvent) => {
    const { timestamp, source } = e.detail || {};
    console.log('تم استلام إشعار بتحديث القنوات:', { timestamp, source });
    
    setLastUpdateTime(new Date().toLocaleString());
    
    // إظهار إشعار للمستخدم
    toast({
      title: "تم تحديث القنوات",
      description: "تم تحديث قائمة القنوات المتاحة. سيتم تحديث الصفحة تلقائيًا.",
      duration: 4000,
    });
    
    // تأخير التحديث لإتاحة الوقت للمستخدم لقراءة الإشعار
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, [toast]);
  
  // معالجة تغييرات التخزين المحلي
  const handleStorageChange = useCallback((e: StorageEvent) => {
    const forceRefreshKeys = [
      'force_browser_refresh',
      'bladi_force_refresh',
      'force_update',
      'force_reload_all'
    ];
    
    if (e.key && forceRefreshKeys.includes(e.key) && e.newValue === 'true') {
      console.log('تم اكتشاف طلب تحديث من مصدر خارجي:', e.key);
      
      // إظهار إشعار للمستخدم
      toast({
        title: "طلب تحديث",
        description: "تم استلام طلب لتحديث صفحة القنوات. سيتم التحديث تلقائيًا.",
      });
      
      // تأخير التحديث لإتاحة الوقت للمستخدم لقراءة الإشعار
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }, [toast]);
  
  // إضافة المستمعين للأحداث
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
