
import React, { useState } from 'react';
import { syncWithBladiInfo } from '@/services/sync';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HomeSyncProps {
  refetchChannels: () => Promise<any>;
}

const HomeSync: React.FC<HomeSyncProps> = ({ refetchChannels }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Synchronize channels with BLADI sources
  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      toast({
        title: "جاري المزامنة",
        description: "جاري جلب أحدث القنوات من المصادر الخارجية..."
      });
      
      // Call sync function with force flag to update and prevent duplicates
      const result = await syncWithBladiInfo(true, { preventDuplicates: true });
      
      if (result.updated) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: `تم تحديث ${result.channelsCount} قناة بنجاح`
        });
        
        // Reload channels
        await refetchChannels();
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
        description: "تعذر الاتصال بمصادر البيانات الخارجية",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
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
  );
};

export default HomeSync;
