
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { syncDataUnified } from '@/services/sync/core/unifiedSync';
import { getLastSyncTime } from '@/services/sync/status/timestamp';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface HomeSyncProps {
  refetchChannels: () => Promise<any>;
}

const HomeSync: React.FC<HomeSyncProps> = ({ refetchChannels }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  // تحسين: تحميل وقت آخر مزامنة وتحديثه دوريًا
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

  // Synchronize channels with optimized method
  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const startTime = Date.now();
      
      // تحسين: إضافة وقت بدء المزامنة للقياس
      toast({
        title: "جاري المزامنة",
        description: "جاري تحديث البيانات من المصادر المتاحة...",
        duration: 3000,
      });
      
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
        
        // Reload channels
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

  // تحسين: تنسيق وقت آخر مزامنة بشكل أفضل
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
    </div>
  );
};

export default HomeSync;
