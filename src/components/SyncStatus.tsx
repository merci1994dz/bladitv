
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLastSyncTime, syncAllData, isSyncInProgress } from '@/services/syncService';
import { Clock, CloudOff, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const SyncStatus: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // جلب وقت آخر مزامنة
  const { data: lastSync, refetch: refetchLastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    refetchInterval: 60000, // إعادة الفحص كل دقيقة للتأكد من حداثة البيانات
  });

  // تشغيل المزامنة اليدوية
  const { mutate: runSync, isPending: isSyncing } = useMutation({
    mutationFn: syncAllData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lastSync'] });
      refetchLastSync();
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث البيانات بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "فشلت المزامنة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    }
  });

  if (!lastSync) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <CloudOff className="w-3 h-3" />
          <span>لم تتم المزامنة بعد</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => runSync()}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="sr-only">تحديث</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>تحديث الآن</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  const lastSyncDate = new Date(lastSync);
  const timeAgo = formatDistanceToNow(lastSyncDate, { 
    addSuffix: true,
    locale: ar 
  });

  const isRecent = Date.now() - lastSyncDate.getTime() < 1000 * 60 * 5;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {isRecent ? (
          <RefreshCw className="w-3 h-3 text-green-500" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        <span>آخر تحديث: {timeAgo}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => runSync()}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="sr-only">تحديث</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تحديث الآن</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default SyncStatus;
