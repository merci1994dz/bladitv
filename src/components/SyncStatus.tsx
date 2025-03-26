
import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export interface SyncStatusProps {
  lastSync?: string | null;
  syncStatus: 'success' | 'error' | 'syncing' | 'idle';
  errorMessage?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ 
  lastSync, 
  syncStatus, 
  errorMessage 
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {syncStatus === 'success' && (
        <div className="flex items-center text-green-500">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>تمت المزامنة</span>
          {lastSync && (
            <span className="text-muted-foreground mr-1">
              ({new Date(lastSync).toLocaleTimeString()})
            </span>
          )}
        </div>
      )}
      
      {syncStatus === 'error' && (
        <div className="flex items-center text-red-500">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>{errorMessage || 'فشلت المزامنة'}</span>
        </div>
      )}
      
      {syncStatus === 'syncing' && (
        <div className="flex items-center text-primary">
          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          <span>جاري المزامنة...</span>
        </div>
      )}
      
      {syncStatus === 'idle' && (
        <div className="flex items-center text-muted-foreground">
          <span>لم تتم المزامنة</span>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;
