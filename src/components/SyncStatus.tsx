
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLastSyncTime, isSyncInProgress, forceDataRefresh, checkBladiInfoAvailability } from '@/services/sync';
import { syncWithSupabase } from '@/services/sync/supabaseSync';
import { Clock, CloudOff, RefreshCw, AlertTriangle, Globe, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SyncStatusProps {
  isAdmin?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ isAdmin = false }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  
  // جلب وقت آخر مزامنة
  const { data: lastSync, refetch: refetchLastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    refetchInterval: 60000, // إعادة الفحص كل دقيقة للتأكد من حداثة البيانات
  });

  // التحقق من المصادر المتاحة
  useEffect(() => {
    const checkAvailableSources = async () => {
      try {
        const source = await checkBladiInfoAvailability();
        setAvailableSource(source);
      } catch (error) {
        console.error('خطأ في التحقق من المصادر المتاحة:', error);
      }
    };
    
    checkAvailableSources();
    
    // إعادة الفحص كل 5 دقائق
    const interval = setInterval(checkAvailableSources, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // تشغيل المزامنة مع Supabase
  const { mutate: runSync, isPending: isSyncing } = useMutation({
    mutationFn: () => syncWithSupabase(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lastSync'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      refetchLastSync();
      
      // إعادة التحقق من المصادر المتاحة بعد المزامنة
      checkBladiInfoAvailability().then(setAvailableSource);
      
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث البيانات بنجاح من Supabase",
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

  // تشغيل المزامنة القسرية (للمشرفين فقط)
  const { mutate: runForceSync, isPending: isForceSyncing } = useMutation({
    mutationFn: forceDataRefresh,
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "تم إعادة التحميل القسري",
        description: "تم مسح ذاكرة التخزين المؤقت وإعادة تحميل البيانات",
      });
      
      // إعادة التحقق من المصادر المتاحة بعد التحميل القسري
      checkBladiInfoAvailability().then(setAvailableSource);
    },
    onError: (error) => {
      toast({
        title: "فشلت عملية إعادة التحميل",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إعادة التحميل",
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
                disabled={isSyncing || isForceSyncing}
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

  // Fix TypeScript error by type assertion of lastSync to string
  const lastSyncDate = new Date(lastSync as string);
  const timeAgo = formatDistanceToNow(lastSyncDate, { 
    addSuffix: true,
    locale: ar 
  });

  const isRecent = Date.now() - lastSyncDate.getTime() < 1000 * 60 * 5;
  const isVeryOld = Date.now() - lastSyncDate.getTime() > 1000 * 60 * 60 * 6; // More than 6 hours

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {isRecent ? (
          <RefreshCw className="w-3 h-3 text-green-500" />
        ) : isVeryOld ? (
          <AlertTriangle className="w-3 h-3 text-amber-500" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        <span>آخر تحديث: {timeAgo}</span>
        
        {/* عرض حالة المصدر المتاح */}
        {availableSource && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1 h-5 text-[10px] px-1 text-green-600 border-green-200 bg-green-50">
                <Check className="w-2 h-2" />
                <span>متصل</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>متصل بمصدر البيانات: {availableSource}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* زر التحديث مع Supabase */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => runSync()}
              disabled={isSyncing || isForceSyncing}
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="sr-only">تحديث</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تحديث الآن من Supabase</p>
          </TooltipContent>
        </Tooltip>
        
        {/* زر التحديث القسري (للمشرفين فقط) */}
        {isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-amber-50 hover:bg-amber-100"
                onClick={() => runForceSync()}
                disabled={isSyncing || isForceSyncing}
              >
                <RefreshCw className={`h-3 w-3 text-amber-600 ${isForceSyncing ? 'animate-spin' : ''}`} />
                <span className="sr-only">تحديث قسري</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>تحديث قسري (يمسح ذاكرة التخزين المؤقت)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SyncStatus;
