
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw, XCircle, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      <TooltipProvider>
        {/* زر المزامنة */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>مزامنة البيانات مع آخر تحديثات من المصدر</p>
          </TooltipContent>
        </Tooltip>
        
        {/* زر تحديث البيانات */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleForceDataRefresh}
              disabled={isSyncing || isForceSyncing || !networkStatus.hasInternet}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              تحديث البيانات
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تحديث البيانات مع تخطي ذاكرة التخزين المؤقت</p>
          </TooltipContent>
        </Tooltip>
        
        {/* زر تحديث الصفحة */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleForceRefresh}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              تحديث الصفحة
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تحديث الصفحة بالكامل مع مسح ذاكرة التخزين المؤقت</p>
          </TooltipContent>
        </Tooltip>
        
        {/* زر مسح التخزين المؤقت */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleClearCache}
            >
              <XCircle className="h-4 w-4 mr-1" />
              مسح التخزين المؤقت
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>مسح التخزين المؤقت لتحسين الأداء وإصلاح المشاكل</p>
          </TooltipContent>
        </Tooltip>
        
        {/* زر إظهار/إخفاء الخيارات المتقدمة */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={toggleAdvancedOptions}
            >
              <Settings className="h-4 w-4 mr-1" />
              {showAdvanced ? "إخفاء الخيارات المتقدمة" : "خيارات متقدمة"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>إظهار أو إخفاء الخيارات المتقدمة للمستخدمين ذوي الخبرة</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SyncButtons;
