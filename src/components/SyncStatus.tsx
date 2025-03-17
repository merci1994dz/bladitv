
import React, { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/sync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import NoSyncStatus from './sync/NoSyncStatus';
import SyncStatusDisplay from './sync/SyncStatusDisplay';
import { useSyncMutations } from './sync/useSyncMutations';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { checkConnectivityIssues } from '@/services/sync/status';

interface SyncStatusProps {
  isAdmin?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ isAdmin = false }) => {
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    hasInternet: boolean;
    hasServerAccess: boolean;
  }>({ hasInternet: navigator.onLine, hasServerAccess: false });
  const [isCheckingConnectivity, setIsCheckingConnectivity] = useState(false);
  
  // جلب وقت آخر مزامنة مع خيارات أفضل للتخزين المؤقت
  const { data: lastSync, refetch: refetchLastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    refetchInterval: 60000, // إعادة الفحص كل دقيقة للتأكد من حداثة البيانات
    staleTime: 30000, // البيانات تبقى "طازجة" لمدة 30 ثانية
    retry: 3, // محاولة ثلاث مرات في حالة الفشل
  });

  // استدعاء hook للمزامنة
  const { runSync, isSyncing, runForceSync, isForceSyncing, checkAvailableSource } = useSyncMutations(refetchLastSync);

  // دالة لفحص الاتصال بالشبكة
  const checkNetworkStatus = useCallback(async () => {
    if (isCheckingConnectivity) return;
    
    setIsCheckingConnectivity(true);
    try {
      const status = await checkConnectivityIssues();
      setNetworkStatus(status);
      
      // التحقق من المصادر فقط إذا كان هناك إمكانية للوصول للخادم
      if (status.hasServerAccess) {
        checkAvailableSources();
      }
    } catch (error) {
      console.error('خطأ في فحص حالة الشبكة:', error);
    } finally {
      setIsCheckingConnectivity(false);
    }
  }, [isCheckingConnectivity]);
  
  // التحقق من المصادر المتاحة
  const checkAvailableSources = useCallback(async () => {
    try {
      const source = await checkAvailableSource();
      setAvailableSource(source);
    } catch (error) {
      console.error('خطأ في التحقق من المصادر المتاحة:', error);
    }
  }, [checkAvailableSource]);
  
  // التحقق من المصادر عند التحميل وبشكل دوري
  useEffect(() => {
    // تحقق من الاتصال أولاً
    checkNetworkStatus();
    
    // إعادة الفحص كل 5 دقائق
    const interval = setInterval(() => {
      checkNetworkStatus();
    }, 5 * 60 * 1000);
    
    // إعداد مستمعي الشبكة
    const handleOnline = () => {
      checkNetworkStatus();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkNetworkStatus]);

  // تقديم رمز تحميل إذا كنا نفحص الاتصال
  if (isCheckingConnectivity) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>جاري فحص الاتصال...</span>
      </div>
    );
  }

  // تقديم الحالة في حالة عدم وجود اتصال بالإنترنت
  if (!networkStatus.hasInternet) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          وضع عدم الاتصال
        </Badge>
        <span className="text-gray-500 dark:text-gray-400">
          لا يوجد اتصال بالإنترنت. جاري استخدام البيانات المخزنة محليًا.
        </span>
      </div>
    );
  }

  if (!lastSync) {
    return (
      <NoSyncStatus 
        runSync={runSync}
        isSyncing={isSyncing}
        isForceSyncing={isForceSyncing}
        hasServerAccess={networkStatus.hasServerAccess}
      />
    );
  }

  // تصحيح نوع lastSync بتحويله إلى string
  const lastSyncDate = new Date(lastSync as string);

  return (
    <SyncStatusDisplay
      lastSyncDate={lastSyncDate}
      runSync={runSync}
      runForceSync={runForceSync}
      isSyncing={isSyncing}
      isForceSyncing={isForceSyncing}
      availableSource={availableSource}
      isAdmin={isAdmin}
      networkStatus={networkStatus}
    />
  );
};

export default SyncStatus;
