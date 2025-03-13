
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/syncService';
import { Clock, CloudOff, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const SyncStatus: React.FC = () => {
  const { data: lastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
  });

  if (!lastSync) {
    return (
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <CloudOff className="w-3 h-3 mr-1" />
        <span>لم تتم المزامنة بعد</span>
      </div>
    );
  }

  const lastSyncDate = new Date(lastSync);
  const timeAgo = formatDistanceToNow(lastSyncDate, { 
    addSuffix: true,
    locale: ar 
  });

  return (
    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
      {Date.now() - lastSyncDate.getTime() < 1000 * 60 * 5 ? (
        <RefreshCw className="w-3 h-3 mr-1 text-green-500" />
      ) : (
        <Clock className="w-3 h-3 mr-1" />
      )}
      <span>آخر تحديث: {timeAgo}</span>
    </div>
  );
};

export default SyncStatus;
