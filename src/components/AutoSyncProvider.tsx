
import React, { useEffect } from 'react';
import { syncAllData } from '@/services/sync';
import { REMOTE_CONFIG } from '@/services/config';

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

const AutoSyncProvider: React.FC<AutoSyncProviderProps> = ({ children }) => {
  useEffect(() => {
    if (!REMOTE_CONFIG.ENABLED) {
      return;
    }
    
    // المزامنة عند بدء التشغيل
    syncAllData().catch(console.error);
    
    // إعداد فاصل زمني للمزامنة التلقائية
    const interval = setInterval(() => {
      syncAllData().catch(console.error);
    }, REMOTE_CONFIG.CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);
  
  return <>{children}</>;
};

export default AutoSyncProvider;
