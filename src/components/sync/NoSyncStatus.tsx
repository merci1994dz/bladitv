
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NoSyncStatusProps {
  runSync: () => void;
  isSyncing: boolean;
  isForceSyncing: boolean;
  hasServerAccess?: boolean;
}

const NoSyncStatus: React.FC<NoSyncStatusProps> = ({ 
  runSync, 
  isSyncing, 
  isForceSyncing,
  hasServerAccess = true
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 border border-amber-200 dark:border-amber-800 rounded-md bg-amber-50 dark:bg-amber-950/20">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <span className="font-medium text-amber-700 dark:text-amber-400">
          لم يتم مزامنة البيانات بعد
        </span>
      </div>
      
      <p className="text-sm text-amber-600 dark:text-amber-300/80">
        {hasServerAccess ? (
          'يجب مزامنة البيانات مع الخادم للحصول على أحدث القنوات والفئات.'
        ) : (
          <>
            <WifiOff className="h-3 w-3 inline-block mr-1" />
            تعذر الوصول إلى الخادم. سيتم استخدام البيانات المحلية.
          </>
        )}
      </p>
      
      <div className="flex items-center justify-between mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={runSync}
          disabled={isSyncing || isForceSyncing || !hasServerAccess}
          className={`${isSyncing ? 'bg-amber-100 dark:bg-amber-900/30' : ''} transition-colors`}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
        </Button>
        
        <Badge variant="outline" className="bg-amber-100/30 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50">
          البيانات غير محدثة
        </Badge>
      </div>
    </div>
  );
};

export default NoSyncStatus;
