
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/sync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import NoSyncStatus from './sync/NoSyncStatus';
import SyncStatusDisplay from './sync/SyncStatusDisplay';
import { useSyncMutations } from './sync/useSyncMutations';

interface SyncStatusProps {
  isAdmin?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ isAdmin = false }) => {
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  
  // جلب وقت آخر مزامنة
  const { data: lastSync, refetch: refetchLastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    refetchInterval: 60000, // إعادة الفحص كل دقيقة للتأكد من حداثة البيانات
  });

  // استدعاء hook للمزامنة
  const { runSync, isSyncing, runForceSync, isForceSyncing, checkAvailableSource } = useSyncMutations(refetchLastSync);

  // التحقق من المصادر المتاحة
  useEffect(() => {
    const checkAvailableSources = async () => {
      try {
        const source = await checkAvailableSource();
        setAvailableSource(source);
      } catch (error) {
        console.error('خطأ في التحقق من المصادر المتاحة:', error);
      }
    };
    
    checkAvailableSources();
    
    // إعادة الفحص كل 5 دقائق
    const interval = setInterval(checkAvailableSources, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkAvailableSource]);

  if (!lastSync) {
    return (
      <NoSyncStatus 
        runSync={runSync}
        isSyncing={isSyncing}
        isForceSyncing={isForceSyncing}
      />
    );
  }

  // Fix TypeScript error by type assertion of lastSync to string
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
    />
  );
};

export default SyncStatus;
