
import React from 'react';

interface OfflineNotificationProps {
  isOffline: boolean;
}

export const OfflineNotification: React.FC<OfflineNotificationProps> = ({ isOffline }) => {
  if (!isOffline) return null;
  
  return (
    <div className="bg-amber-500 text-white text-center py-1 px-2 text-sm sticky top-0 z-50">
      أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.
    </div>
  );
};

interface UpdateNotificationProps {
  lastUpdateTime: string | null;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ lastUpdateTime }) => {
  if (!lastUpdateTime) return null;
  
  return (
    <div className="bg-green-500 text-white text-center py-1 px-2 text-sm sticky top-0 z-50">
      تم تحديث القنوات في {lastUpdateTime}
    </div>
  );
};
