
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncInfoProps {
  lastSync: string | null;
  formatLastSync: () => string;
}

const SyncInfo: React.FC<SyncInfoProps> = ({ formatLastSync }) => {
  // حساب ما إذا كان آخر مزامنة حديثة (أقل من 5 دقائق)
  const isRecent = () => {
    const lastSyncTime = formatLastSync();
    if (lastSyncTime === 'لم تتم المزامنة بعد' || lastSyncTime === 'غير معروف') {
      return false;
    }
    return true;
  };

  return (
    <div className="flex flex-col">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-lg font-medium">حالة المزامنة</h3>
          </TooltipTrigger>
          <TooltipContent>
            <p>عرض حالة المزامنة وآخر تحديث للبيانات</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className={`text-sm ${isRecent() ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              آخر مزامنة: {formatLastSync()}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isRecent() 
                ? 'تم تحديث البيانات مؤخرًا'
                : 'قد تحتاج البيانات إلى التحديث. انقر على زر المزامنة'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SyncInfo;
