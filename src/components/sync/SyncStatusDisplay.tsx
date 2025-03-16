
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TooltipProvider } from '@/components/ui/tooltip';
import SyncStatusIcon from './SyncStatusIcon';
import SyncSourceBadge from './SyncSourceBadge';
import SyncButton from './SyncButton';

interface SyncStatusDisplayProps {
  lastSyncDate: Date;
  runSync: () => void;
  runForceSync: () => void;
  isSyncing: boolean;
  isForceSyncing: boolean;
  availableSource: string | null;
  isAdmin: boolean;
}

const SyncStatusDisplay: React.FC<SyncStatusDisplayProps> = ({ 
  lastSyncDate, 
  runSync, 
  runForceSync,
  isSyncing, 
  isForceSyncing,
  availableSource,
  isAdmin
}) => {
  const timeAgo = formatDistanceToNow(lastSyncDate, { 
    addSuffix: true,
    locale: ar 
  });

  const isRecent = Date.now() - lastSyncDate.getTime() < 1000 * 60 * 5;
  const isVeryOld = Date.now() - lastSyncDate.getTime() > 1000 * 60 * 60 * 6; // More than 6 hours

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <SyncStatusIcon isRecent={isRecent} isVeryOld={isVeryOld} />
        <span>آخر تحديث: {timeAgo}</span>
        
        {/* عرض حالة المصدر المتاح */}
        <SyncSourceBadge availableSource={availableSource} />
        
        {/* زر التحديث مع Supabase */}
        <SyncButton
          onClick={runSync}
          isLoading={isSyncing || isForceSyncing}
          tooltipText="تحديث الآن من Supabase"
        />
        
        {/* زر التحديث القسري (للمشرفين فقط) */}
        {isAdmin && (
          <SyncButton
            onClick={runForceSync}
            isLoading={isSyncing || isForceSyncing}
            tooltipText="تحديث قسري (يمسح ذاكرة التخزين المؤقت)"
            variant="amber"
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default SyncStatusDisplay;
