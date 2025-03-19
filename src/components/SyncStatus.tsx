
/**
 * مكون حالة المزامنة المحسن مع معالجة أفضل للأخطاء
 */

import React, { useEffect, useState, useRef } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/sync/status/timestamp';
import { useSyncMutations } from './sync/useSyncMutations';
import SyncErrorDisplay from './sync/SyncErrorDisplay';
import SyncActions from './sync/SyncActions';
import SyncStatusInfo from './sync/SyncStatusInfo';
import SyncAdvancedOptions from './sync/SyncAdvancedOptions';
import { toast } from '@/hooks/use-toast';

export function SyncStatus() {
  const { syncError, checkSourceAvailability, networkStatus } = useAutoSync();
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deploymentPlatform, setDeploymentPlatform] = useState<string>('vercel');
  const [syncStartTime, setSyncStartTime] = useState<number>(0);
  const [lastSyncDuration, setLastSyncDuration] = useState<number>(0);
  
  // جلب آخر وقت مزامنة
  const { data: lastSync, refetch: refetchLastSync, error: syncQueryError } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    staleTime: 60 * 1000, // دقيقة واحدة
  });

  // معالجة الأخطاء عند فشل الاستعلام
  useEffect(() => {
    if (syncQueryError) {
      console.error('خطأ في جلب وقت آخر مزامنة:', syncQueryError);
      toast({
        title: "تعذر جلب معلومات المزامنة",
        description: "سيتم استخدام البيانات المخزنة محليًا.",
        variant: "destructive"
      });
    }
  }, [syncQueryError]);

  // استخدام طلبات المزامنة المتغيرة مع التعديلات لتتبع مدة المزامنة
  const { runSync, isSyncing, runForceSync, isForceSyncing } = useSyncMutations(refetchLastSync, {
    onSyncStart: () => setSyncStartTime(Date.now()),
    onSyncEnd: () => {
      if (syncStartTime > 0) {
        setLastSyncDuration(Date.now() - syncStartTime);
      }
    }
  });

  // تتبع بداية ونهاية المزامنة لحساب المدة
  useEffect(() => {
    if (isSyncing && syncStartTime === 0) {
      setSyncStartTime(Date.now());
    } else if (!isSyncing && syncStartTime > 0) {
      setLastSyncDuration(Date.now() - syncStartTime);
      setSyncStartTime(0);
    }
  }, [isSyncing, syncStartTime]);

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

  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg bg-background shadow-sm">
      {/* Display error notification if there's an error */}
      <SyncErrorDisplay syncError={syncError} />
      
      {/* Status information section */}
      <SyncStatusInfo 
        lastSync={lastSync}
        formatLastSync={formatLastSync}
        networkStatus={networkStatus}
        syncError={syncError}
        cacheCleared={cacheCleared}
        deploymentPlatform={deploymentPlatform}
        isSyncing={isSyncing || isForceSyncing}
        lastSyncDuration={lastSyncDuration}
        syncQueryError={syncQueryError}
      />
      
      {/* Sync action buttons */}
      <SyncActions 
        isSyncing={isSyncing}
        isForceSyncing={isForceSyncing}
        networkStatus={networkStatus}
        runSync={runSync}
        runForceSync={runForceSync}
        setCacheCleared={setCacheCleared}
        toggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        showAdvanced={showAdvanced}
      />
      
      {/* Advanced options section */}
      <SyncAdvancedOptions 
        showAdvanced={showAdvanced}
        availableSource={availableSource}
      />
    </div>
  );
}

export default SyncStatus;
