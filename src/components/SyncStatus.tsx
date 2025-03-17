
/**
 * مكون حالة المزامنة المحسن مع معالجة أفضل للأخطاء
 */

import React, { useEffect, useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/sync/status';
import { toast } from '@/hooks/use-toast';
import { useSyncMutations } from './sync/useSyncMutations';
import SyncErrorNotification from './sync/SyncErrorNotification';

export function SyncStatus() {
  const { syncError, checkSourceAvailability, networkStatus } = useAutoSync();
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  
  // جلب آخر وقت مزامنة
  const { data: lastSync, refetch: refetchLastSync } = useQuery({
    queryKey: ['lastSync'],
    queryFn: getLastSyncTime,
    staleTime: 60 * 1000, // دقيقة واحدة
  });

  // استخدام طلبات المزامنة المتغيرة
  const { runSync, isSyncing, runForceSync, isForceSyncing } = useSyncMutations(refetchLastSync);

  // التحقق من مصدر البيانات المتاح عند التحميل
  useEffect(() => {
    async function checkAvailability() {
      try {
        const source = await checkSourceAvailability();
        setAvailableSource(source);
      } catch (error) {
        console.error('خطأ في التحقق من المصادر المتاحة:', error);
      }
    }
    
    checkAvailability();
  }, [checkSourceAvailability]);

  // عرض آخر وقت مزامنة بتنسيق مناسب
  const formatLastSync = () => {
    if (!lastSync) return 'لم تتم المزامنة بعد';
    
    try {
      // التحقق من أن lastSync هو سلسلة نصية قبل تمريره إلى Date
      const date = typeof lastSync === 'string' ? new Date(lastSync) : new Date();
      return new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return 'غير معروف';
    }
  };

  // معالجة نقر زر المزامنة
  const handleSyncClick = () => {
    if (isSyncing || isForceSyncing) return;
    
    toast({
      title: "جاري المزامنة",
      description: "جاري تحديث البيانات من المصادر المتاحة...",
      duration: 3000,
    });
    
    runSync();
  };

  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg bg-background shadow-sm">
      {/* عرض إشعار الخطأ إذا وجد */}
      {syncError && <SyncErrorNotification syncError={syncError} />}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium">حالة المزامنة</h3>
          <p className="text-sm text-muted-foreground">
            آخر مزامنة: {formatLastSync()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* مؤشر حالة الشبكة */}
          <Badge variant={networkStatus.hasInternet ? "outline" : "destructive"} className="gap-1 px-2">
            {networkStatus.hasInternet ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>متصل</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>غير متصل</span>
              </>
            )}
          </Badge>
          
          {/* مؤشر حالة المزامنة */}
          <Badge 
            variant={syncError ? "destructive" : "outline"} 
            className="gap-1 px-2"
          >
            {syncError ? (
              <>
                <XCircle className="h-3 w-3" />
                <span>خطأ</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>متزامن</span>
              </>
            )}
          </Badge>
          
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
        </div>
      </div>
      
      {/* معلومات المصدر المتاح */}
      {process.env.NODE_ENV === 'development' && availableSource && (
        <div className="mt-2 text-xs bg-muted p-2 rounded overflow-hidden">
          <span className="font-semibold">المصدر المتاح: </span>
          <span className="opacity-70 text-[10px] break-all">{availableSource}</span>
        </div>
      )}
    </div>
  );
}

export default SyncStatus;
