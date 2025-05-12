
import React, { useState, useEffect } from 'react';
import { RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { syncDataUnified } from '@/services/sync/core/unifiedSync';
import { getLastSyncTime } from '@/services/sync/status/timestamp';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/sourceAvailability';
import SyncStatusIcon from '@/components/sync/SyncStatusIcon';
import { Badge } from '@/components/ui/badge';

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
    // إضافة فحص دوري للمصادر المتاحة
    const interval = setInterval(checkAvailableSources, 5 * 60 * 1000); // كل 5 دقائق
    
    return () => clearInterval(interval);
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
  const isVeryOld = lastSync ? (Date.now() - lastSync.getTime() > 6 * 60 * 60 * 1000) : false;
  const isRecent = lastSync ? (Date.now() - lastSync.getTime() < 5 * 60 * 1000) : false;
  
  return (
    <div className="flex items-center gap-2">
      {lastSyncText && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <SyncStatusIcon 
            isRecent={isRecent} 
            isVeryOld={isVeryOld} 
            noSync={!availableSource} 
            isActive={isSyncing}
            size="sm"
          />
          <span>{lastSyncText}</span>
        </div>
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
        <Badge variant="outline" className="bg-green-100 text-green-800 text-xs border-green-200">
          <Cloud className="h-3 w-3 mr-1" />
          متصل
        </Badge>
      )}
      
      {!availableSource && (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs border-amber-200">
          <CloudOff className="h-3 w-3 mr-1" />
          محلي
        </Badge>
      )}
    </div>
  );
};

export default HomeSync;
