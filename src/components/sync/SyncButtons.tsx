
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw, XCircle } from 'lucide-react';

interface SyncButtonsProps {
  isSyncing: boolean;
  isForceSyncing: boolean;
  networkStatus: {
    hasInternet: boolean;
  };
  handleSyncClick: () => void;
  handleForceDataRefresh: () => void;
  handleForceRefresh: () => void;
  handleClearCache: () => void;
  toggleAdvancedOptions: () => void;
  showAdvanced: boolean;
}

const SyncButtons: React.FC<SyncButtonsProps> = ({
  isSyncing,
  isForceSyncing,
  networkStatus,
  handleSyncClick,
  handleForceDataRefresh,
  handleForceRefresh,
  handleClearCache,
  toggleAdvancedOptions,
  showAdvanced
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {/* زر المزامنة */}
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleSyncClick}
        disabled={isSyncing || isForceSyncing || !networkStatus.hasInternet}
        className={isSyncing || isForceSyncing ? "animate-pulse" : ""}
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing || isForceSyncing ? "animate-spin" : ""}`} />
        مزامنة
      </Button>
      
      {/* زر تحديث البيانات */}
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleForceDataRefresh}
        disabled={isSyncing || isForceSyncing || !networkStatus.hasInternet}
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        تحديث البيانات
      </Button>
      
      {/* زر تحديث الصفحة */}
      <Button 
        size="sm" 
        variant="secondary" 
        onClick={handleForceRefresh}
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        تحديث الصفحة
      </Button>
      
      {/* زر مسح التخزين المؤقت */}
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={handleClearCache}
      >
        <XCircle className="h-4 w-4 mr-1" />
        مسح التخزين المؤقت
      </Button>
      
      {/* زر إظهار/إخفاء الخيارات المتقدمة */}
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={toggleAdvancedOptions}
      >
        {showAdvanced ? "إخفاء الخيارات المتقدمة" : "خيارات متقدمة"}
      </Button>
    </div>
  );
};

export default SyncButtons;
