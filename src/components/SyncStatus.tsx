
/**
 * مكون حالة المزامنة المحسن مع معالجة أفضل للأخطاء
 */

import React, { useEffect, useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/sync/status/timestamp';
import { useSyncMutations } from './sync/useSyncMutations';
import SyncErrorDisplay from './sync/SyncErrorDisplay';
import SyncActions from './sync/SyncActions';
import SyncStatusInfo from './sync/SyncStatusInfo';
import SyncAdvancedOptions from './sync/SyncAdvancedOptions';

export function SyncStatus() {
  const { syncError, checkSourceAvailability, networkStatus } = useAutoSync();
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deploymentPlatform, setDeploymentPlatform] = useState<string>('vercel');
  const [syncStartTime, setSyncStartTime] = useState<number>(0);
  const [lastSyncDuration, setLastSyncDuration] = useState<number>(0);
  
  const { data: lastSync, refetch: refetchLastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    staleTime: 60 * 1000, // دقيقة واحدة
  });

  const { runSync, isSyncing, runForceSync, isForceSyncing } = useSyncMutations(refetchLastSync, {
    onSyncStart: () => setSyncStartTime(Date.now()),
    onSyncEnd: () => {
      if (syncStartTime > 0) {
        setLastSyncDuration(Date.now() - syncStartTime);
      }
    }
  });

  useEffect(() => {
    if (isSyncing && syncStartTime === 0) {
      setSyncStartTime(Date.now());
    } else if (!isSyncing && syncStartTime > 0) {
      setLastSyncDuration(Date.now() - syncStartTime);
      setSyncStartTime(0);
    }
  }, [isSyncing, syncStartTime]);

  useEffect(() => {
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

  useEffect(() => {
    if (deploymentPlatform === 'Vercel') {
      setTimeout(() => {
        if (!isSyncing && !isForceSyncing) {
          runSync();
        }
      }, 3000);
      
      const intervalId = setInterval(() => {
        if (!isSyncing && !isForceSyncing && networkStatus.hasInternet) {
          runSync();
        }
      }, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [deploymentPlatform, isSyncing, isForceSyncing, networkStatus.hasInternet, runSync]);

  const formatLastSync = () => {
    if (!lastSync) return undefined;
    
    try {
      const date = typeof lastSync === 'string' ? new Date(lastSync) : new Date();
      const formatted = new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
      
      return formatted;
    } catch (e) {
      return undefined;
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg bg-background shadow-sm">
      <SyncErrorDisplay syncError={syncError} />
      
      <SyncStatusInfo 
        networkStatus={networkStatus}
        isChecking={isSyncing || isForceSyncing}
        lastSync={lastSync}
        lastSyncDuration={lastSyncDuration}
        formatLastSync={formatLastSync}
      />
      
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
      
      <SyncAdvancedOptions 
        showAdvanced={showAdvanced}
        availableSource={availableSource}
      />
    </div>
  );
}

export default SyncStatus;
