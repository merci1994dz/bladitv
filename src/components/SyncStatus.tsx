
/**
 * مكون حالة المزامنة المحسن مع معالجة أفضل للأخطاء
 */

import React, { useEffect, useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, XCircle, CheckCircle2, Wifi, WifiOff, AlertTriangle, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLastSyncTime } from '@/services/sync/status/timestamp';
import { toast } from '@/hooks/use-toast';
import { useSyncMutations } from './sync/useSyncMutations';
import SyncErrorNotification from './sync/SyncErrorNotification';
import { immediateRefresh, clearPageCache, forceDataRefresh, resetAppData } from '../services/sync/forceRefresh';

export function SyncStatus() {
  const { syncError, checkSourceAvailability, networkStatus } = useAutoSync();
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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

  // معالجة نقر زر تحديث البيانات
  const handleForceDataRefresh = async () => {
    toast({
      title: "جاري تحديث البيانات",
      description: "جاري تحديث البيانات مع منع التخزين المؤقت...",
      duration: 3000,
    });
    
    await forceDataRefresh();
    runForceSync();
  };

  // معالجة نقر زر تحديث الصفحة
  const handleForceRefresh = () => {
    toast({
      title: "جاري تحديث الصفحة",
      description: "جاري مسح التخزين المؤقت وإعادة تحميل الصفحة...",
      duration: 2000,
    });
    
    // تنفيذ تحديث فوري مع مسح التخزين المؤقت
    setTimeout(() => {
      immediateRefresh();
    }, 1000);
  };

  // معالجة مسح التخزين المؤقت
  const handleClearCache = async () => {
    toast({
      title: "جاري مسح التخزين المؤقت",
      description: "جاري مسح جميع بيانات التخزين المؤقت...",
      duration: 2000,
    });
    
    const result = await clearPageCache();
    setCacheCleared(result);
    
    toast({
      title: result ? "تم مسح التخزين المؤقت" : "فشل مسح التخزين المؤقت",
      description: result ? "تم مسح التخزين المؤقت بنجاح" : "حدث خطأ أثناء مسح التخزين المؤقت",
      duration: 3000,
    });
  };

  // معالجة إعادة ضبط التطبيق
  const handleResetApp = async () => {
    const confirmReset = window.confirm("هل أنت متأكد من إعادة ضبط التطبيق؟ سيتم مسح جميع البيانات المخزنة محليًا.");
    
    if (confirmReset) {
      toast({
        title: "جاري إعادة ضبط التطبيق",
        description: "جاري مسح جميع البيانات المخزنة وإعادة تحميل الصفحة...",
        duration: 3000,
      });
      
      await resetAppData();
      
      // إعادة تحميل الصفحة بعد مهلة قصيرة
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname + 
          `?reset=${Date.now()}&nocache=true`;
      }, 2000);
    }
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
        
        <div className="flex flex-wrap items-center gap-2">
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
          
          {/* مؤشر التخزين المؤقت */}
          <Badge 
            variant={cacheCleared ? "outline" : "secondary"} 
            className="gap-1 px-2"
          >
            {cacheCleared ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>تم مسح التخزين المؤقت</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span>التخزين المؤقت</span>
              </>
            )}
          </Badge>
        </div>
      </div>
      
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
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "إخفاء الخيارات المتقدمة" : "خيارات متقدمة"}
        </Button>
      </div>
      
      {/* الخيارات المتقدمة */}
      {showAdvanced && (
        <div className="mt-2 p-2 border rounded bg-muted/50">
          <div className="flex flex-col space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              الخيارات المتقدمة للصيانة. استخدم بحذر.
            </p>
            
            <div className="flex flex-wrap gap-2">
              {/* زر إعادة ضبط التطبيق */}
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleResetApp}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                إعادة ضبط التطبيق
              </Button>
            </div>
            
            {/* معلومات المصدر المتاح */}
            {availableSource && (
              <div className="mt-2 text-xs bg-muted p-2 rounded overflow-hidden">
                <span className="font-semibold">المصدر المتاح: </span>
                <span className="opacity-70 text-[10px] break-all">{availableSource}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SyncStatus;
