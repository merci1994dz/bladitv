
import React from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import SyncErrorNotification from './sync/SyncErrorNotification';
import AvailableSourceLogger from './sync/AvailableSourceLogger';
import SyncInitializer from './sync/SyncInitializer';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useUpdateEvents } from '@/hooks/useUpdateEvents';
import { OfflineNotification, UpdateNotification } from './sync/StatusNotifications';

interface AutoSyncProviderProps {
  children: React.ReactNode;
}

const AutoSyncProvider: React.FC<AutoSyncProviderProps> = ({ children }) => {
  const { syncError, availableSource } = useAutoSync();
  const { isOffline } = useNetworkStatus();
  const { lastUpdateTime } = useUpdateEvents();
  
  return (
    <>
      {/* عرض إشعار للمستخدم عندما يكون في وضع عدم الاتصال */}
      <OfflineNotification isOffline={isOffline} />
      
      {/* إظهار شريط إشعار عند تحديث القنوات مؤخرًا */}
      <UpdateNotification lastUpdateTime={lastUpdateTime} />
      
      {/* معالجة تهيئة المزامنة والاستماع للأحداث */}
      <SyncInitializer>
        {/* عرض إشعارات الخطأ */}
        <SyncErrorNotification syncError={syncError} />
        
        {/* تسجيل المصادر المتاحة في وضع التطوير */}
        <AvailableSourceLogger availableSource={availableSource} />
        
        {/* عرض الأطفال */}
        {children}
      </SyncInitializer>
    </>
  );
};

export default AutoSyncProvider;
