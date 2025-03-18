
import React from 'react';
import { Clock } from 'lucide-react';

interface SyncInfoDisplayProps {
  lastSync: string | null;
  formatLastSync: () => string;
}

export const SyncInfoDisplay: React.FC<SyncInfoDisplayProps> = ({ 
  lastSync, 
  formatLastSync 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="text-sm">
        <span className="font-medium">آخر تحديث:</span>
        <span className="ml-2 text-muted-foreground">{formatLastSync()}</span>
      </div>
    </div>
  );
};
