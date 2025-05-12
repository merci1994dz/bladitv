
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

  // Load last sync time and update it periodically
  useEffect(() => {
    const updateLastSyncTime = () => {
      const lastSyncTime = getLastSyncTime();
      if (lastSyncTime) {
        setLastSync(new Date(lastSyncTime));
      }
    };
    
    updateLastSyncTime();
    const interval = setInterval(updateLastSyncTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Check for available sources when component loads
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
    const interval = setInterval(checkAvailableSources, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Sync channels with optimized method - reduced notifications
  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      // Remove start notification
      // Silent check for available sources
      const source = await checkBladiInfoAvailability();
      setAvailableSource(source);
      
      if (!source) {
        console.log("لا توجد مصادر متاحة. سيتم استخدام البيانات المخزنة محليًا.");
        setIsSyncing(false);
        return;
      }
      
      const result = await syncDataUnified({
        forceRefresh: true,
        showNotifications: false,
        preventDuplicates: true
      });
      
      if (result) {
        // Refresh channels silently without notification
        await refetchChannels();
        
        // Update last sync time
        const lastSyncTime = getLastSyncTime();
        if (lastSyncTime) {
          setLastSync(new Date(lastSyncTime));
        }
      }
    } catch (error) {
      console.error("خطأ في المزامنة:", error);
      // Only show critical errors
      if (error instanceof Error && error.message.includes('critical')) {
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر الاتصال بمصادر البيانات",
          variant: "destructive"
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Format last sync time
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
