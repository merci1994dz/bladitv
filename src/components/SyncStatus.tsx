
import React, { useEffect, useState } from 'react';
import { getLastSyncTime, getRemoteConfig } from '@/services/syncService';
import { REMOTE_CONFIG } from '@/services/config';
import { CloudSync } from 'lucide-react';

const SyncStatus: React.FC = () => {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // الحصول على آخر وقت مزامنة
    const lastSyncTime = getLastSyncTime();
    setLastSync(lastSyncTime);
    
    // الحصول على تكوين المصدر الخارجي
    const remoteConfig = getRemoteConfig();
    if (remoteConfig) {
      setRemoteUrl(remoteConfig.url);
    }
    
    // إعداد فاصل زمني للتحديث
    const interval = setInterval(() => {
      const updatedSync = getLastSyncTime();
      setLastSync(updatedSync);
      
      const updatedConfig = getRemoteConfig();
      if (updatedConfig) {
        setRemoteUrl(updatedConfig.url);
      }
    }, 60000); // تحديث كل دقيقة
    
    return () => clearInterval(interval);
  }, []);
  
  if (!REMOTE_CONFIG.ENABLED || (!lastSync && !remoteUrl)) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm z-50">
      <CloudSync className="h-3 w-3" />
      <span>
        {remoteUrl ? 'متزامن مع مصدر خارجي' : 'بيانات محلية'}
        {lastSync && ` - ${new Date(lastSync).toLocaleString()}`}
      </span>
    </div>
  );
};

export default SyncStatus;
