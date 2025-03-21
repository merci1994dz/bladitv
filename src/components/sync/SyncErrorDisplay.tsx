
import React, { useEffect, useState } from 'react';
import SyncErrorNotification from './SyncErrorNotification';
import { getSyncError } from '@/services/sync/status/errorHandling';

interface SyncErrorDisplayProps {
  syncError: string | null;
}

/**
 * SyncErrorDisplay component to display sync errors
 * This component gets the error from localStorage if not provided directly
 */
const SyncErrorDisplay: React.FC<SyncErrorDisplayProps> = ({ syncError: propsSyncError }) => {
  const [localSyncError, setLocalSyncError] = useState<string | null>(null);
  
  // إذا لم يتم توفير خطأ مباشر، قم بالتحقق من التخزين المحلي
  useEffect(() => {
    if (propsSyncError === null) {
      const storedError = getSyncError();
      if (storedError) {
        setLocalSyncError(storedError.message);
      } else {
        setLocalSyncError(null);
      }
    }
  }, [propsSyncError]);
  
  // استخدم الخطأ من الخارج إذا كان موجودًا، وإلا استخدم الخطأ المحلي
  const finalError = propsSyncError || localSyncError;
  
  return <SyncErrorNotification syncError={finalError} />;
};

export default SyncErrorDisplay;
