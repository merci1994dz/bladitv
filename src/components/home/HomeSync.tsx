
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { syncDataUnified } from '@/services/sync/core/unifiedSync';
import { getLastSyncTime } from '@/services/sync/status/timestamp';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/sourceAvailability';

interface HomeSyncProps {
  refetchChannels: () => Promise<any>;
}

const HomeSync: React.FC<HomeSyncProps> = ({ refetchChannels }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const { toast } = useToast();

  // تحميل وقت آخر مزامنة وتحديثه دوريًا
  useEffect(() => {
    const updateLastSyncTime = () => {
      const lastSyncTime = getLastSyncTime();
      if (lastSyncTime) {
        setLastSync(new Date(lastSyncTime));
      }
    };
    
    updateLastSyncTime();
    const interval = setInterval(updateLastSyncTime, 60000); // تحديث كل دقيقة
    
    return () => clearInterval(interval);
  }, []);

  // التحقق من المصادر المتاحة عند تحميل المكون
  useEffect(() => {
    const checkAvailableSources = async () => {
      try {
        const source = await checkBladiInfoAvailability();
        setAvailableSource(source);
      } catch (error) {
        console.error("خطأ في التحقق من المصادر المتاحة:", error);
        setAvailableSource(null);
      }
    };
    
    checkAvailableSources();
  }, []);

  // مزامنة القنوات باستخدام طريقة محسنة
  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const startTime = Date.now();
      
      // إضافة وقت بدء المزامنة للقياس
      toast({
        title: "جاري المزامنة",
        description: "جاري تحديث البيانات من المصادر المتاحة...",
        duration: 3000,
      });
      
      // إعادة التحقق من المصادر المتاحة
      const source = await checkBladiInfoAvailability();
      setAvailableSource(source);
      
      if (!source) {
        toast({
          title: "تحذير",
          description: "لا توجد مصادر متاحة. سيتم استخدام البيانات المخزنة محليًا.",
          variant: "destructive",
          duration: 5000,
        });
        setIsSyncing(false);
        return;
      }
      
      const result = await syncDataUnified({
        forceRefresh: true,
        showNotifications: false,
        preventDuplicates: true
      });
      
      const syncDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (result) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: `تم تحديث القنوات بنجاح (${syncDuration} ثانية)`
        });
        
        // إعادة تحميل القنوات
        await refetchChannels();
        
        // تحديث وقت آخر مزامنة
        const lastSyncTime = getLastSyncTime();
        if (lastSyncTime) {
          setLastSync(new Date(lastSyncTime));
        }
      } else {
        toast({
          title: "لا يوجد تحديثات جديدة",
          description: "جميع القنوات محدثة بالفعل"
        });
      }
    } catch (error) {
      console.error("خطأ في المزامنة:", error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر الاتصال بمصادر البيانات",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // تنسيق وقت آخر مزامنة بشكل أفضل
  const getLastSyncText = () => {
    if (!lastSync) return null;
    
    return formatDistanceToNow(lastSync, { 
      addSuffix: true,
      locale: ar
    });
  };

  const lastSyncText = getLastSyncText();

  return (
    <div className="flex items-center gap-2">
      {lastSyncText && (
        <span className="text-xs text-gray-400">
          {lastSyncText}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing}
        className="flex items-center gap-2 bg-background/90 hover:bg-background transition-all shadow-md hover:shadow-lg hover:scale-105 duration-200 rounded-lg border-primary/20"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-primary' : 'text-primary'}`} />
        <span className="font-medium">{isSyncing ? "جاري التحديث..." : "تحديث"}</span>
      </Button>
      {availableSource && (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
          مصدر متاح
        </span>
      )}
      {!availableSource && (
        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
          وضع محلي
        </span>
      )}
    </div>
  );
};

export default HomeSync;
