
/**
 * مكون حالة المزامنة المحسن مع معالجة أفضل للأخطاء
 */

import React, { useEffect, useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/sync/status/timestamp';
import { toast } from '@/hooks/use-toast';
import { useSyncMutations } from './sync/useSyncMutations';
import SyncErrorNotification from './sync/SyncErrorNotification';
import { immediateRefresh, clearPageCache, forceDataRefresh, resetAppData } from '../services/sync/forceRefresh';
import SyncIndicators from './sync/SyncIndicators';
import SyncButtons from './sync/SyncButtons';
import AdvancedOptions from './sync/AdvancedOptions';
import SyncInfo from './sync/SyncInfo';

export function SyncStatus() {
  const { syncError, checkSourceAvailability, networkStatus } = useAutoSync();
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deploymentPlatform, setDeploymentPlatform] = useState<string>('vercel');
  
  // جلب آخر وقت مزامنة
  const { data: lastSync, refetch: refetchLastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    staleTime: 60 * 1000, // دقيقة واحدة
  });

  // استخدام طلبات المزامنة المتغيرة
  const { runSync, isSyncing, runForceSync, isForceSyncing } = useSyncMutations(refetchLastSync);

  // التحقق من بيئة النشر
  useEffect(() => {
    // التحقق من وجود بيئة Vercel
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('vercel.app')) {
        setDeploymentPlatform('Vercel');
      } else if (window.location.hostname.includes('netlify.app')) {
        setDeploymentPlatform('Netlify');
      } else if (window.location.hostname.includes('github.io')) {
        setDeploymentPlatform('GitHub Pages');
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setDeploymentPlatform('محلي');
      }
    }
  }, []);

  // التحقق من مصدر البيانات المتاح عند التحميل
  useEffect(() => {
    async function checkAvailability() {
      try {
        const source = await checkSourceAvailability();
        setAvailableSource(source);
      } catch (error) {
        console.error('خطأ في التحقق من المصادر المتاحة:', error);
      }
    }
    
    checkAvailability();
  }, [checkSourceAvailability]);

  // إضافة مؤقت للتحقق الدوري من المزامنة عند النشر على Vercel
  useEffect(() => {
    if (deploymentPlatform === 'Vercel') {
      // تنفيذ مزامنة أولية بعد التحميل
      setTimeout(() => {
        if (!isSyncing && !isForceSyncing) {
          runSync();
        }
      }, 3000);
      
      // إعداد مؤقت للتحقق الدوري كل 5 دقائق
      const intervalId = setInterval(() => {
        if (!isSyncing && !isForceSyncing && networkStatus.hasInternet) {
          runSync();
        }
      }, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [deploymentPlatform, isSyncing, isForceSyncing, networkStatus.hasInternet, runSync]);

  // عرض آخر وقت مزامنة بتنسيق مناسب
  const formatLastSync = () => {
    if (!lastSync) return 'لم تتم المزامنة بعد';
    
    try {
      // التحقق من أن lastSync هو سلسلة نصية قبل تمريره إلى Date
      const date = typeof lastSync === 'string' ? new Date(lastSync) : new Date();
      return new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return 'غير معروف';
    }
  };

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

  // معالجة إعادة ضبط التطبيق
  const handleResetApp = async () => {
    const confirmReset = window.confirm("هل أنت متأكد من إعادة ضبط التطبيق؟ سيتم مسح جميع البيانات المخزنة محليًا.");
    
    if (confirmReset) {
      toast({
        title: "جاري إعادة ضبط التطبيق",
        description: "جاري مسح جميع البيانات المخزنة وإعادة تحميل الصفحة...",
        duration: 3000,
      });
      
      await resetAppData();
      
      // إعادة تحميل الصفحة بعد مهلة قصيرة
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname + 
          `?reset=${Date.now()}&nocache=true`;
      }, 2000);
    }
  };

  // معالجة تبديل عرض الخيارات المتقدمة
  const toggleAdvancedOptions = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg bg-background shadow-sm">
      {/* عرض إشعار الخطأ إذا وجد */}
      {syncError && <SyncErrorNotification syncError={syncError} />}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* معلومات المزامنة */}
        <SyncInfo 
          lastSync={lastSync} 
          formatLastSync={formatLastSync} 
        />
        
        {/* مؤشرات الحالة */}
        <SyncIndicators 
          networkStatus={networkStatus} 
          syncError={syncError} 
          cacheCleared={cacheCleared}
          deploymentPlatform={deploymentPlatform}
        />
      </div>
      
      {/* أزرار المزامنة والتحديث */}
      <SyncButtons 
        isSyncing={isSyncing}
        isForceSyncing={isForceSyncing}
        networkStatus={networkStatus}
        handleSyncClick={handleSyncClick}
        handleForceDataRefresh={handleForceDataRefresh}
        handleForceRefresh={handleForceRefresh}
        handleClearCache={handleClearCache}
        toggleAdvancedOptions={toggleAdvancedOptions}
        showAdvanced={showAdvanced}
      />
      
      {/* الخيارات المتقدمة */}
      <AdvancedOptions 
        showAdvanced={showAdvanced}
        handleResetApp={handleResetApp}
        availableSource={availableSource}
      />
    </div>
  );
}

export default SyncStatus;
