
import React from 'react';

interface SyncInfoProps {
  lastSync: string | null;
  formatLastSync: () => string;
}

const SyncInfo: React.FC<SyncInfoProps> = ({ formatLastSync }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-medium">حالة المزامنة</h3>
      <p className="text-sm text-muted-foreground">
        آخر مزامنة: {formatLastSync()}
      </p>
    </div>
  );
};

export default SyncInfo;
