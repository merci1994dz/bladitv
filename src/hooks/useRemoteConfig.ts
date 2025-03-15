
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getRemoteConfig, setRemoteConfig, syncWithRemoteSource } from '@/services/sync/remote';

export const useRemoteConfig = (isAuthenticated: boolean) => {
  const { toast } = useToast();
  const [remoteUrl, setRemoteUrl] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      // تحميل التكوين الحالي
      const config = getRemoteConfig();
      if (config) {
        setRemoteUrl(config.url);
        setLastSync(config.lastSync);
      }
    }
  }, [isAuthenticated]);
  
  const handleSaveConfig = async () => {
    // التحقق من صحة الرابط
    if (!remoteUrl) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط صالح للمصدر الخارجي",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // حفظ التكوين
      setRemoteConfig(remoteUrl);
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ رابط المصدر الخارجي بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التكوين",
        variant: "destructive",
      });
    }
  };
  
  const handleSyncNow = async () => {
    if (!remoteUrl) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط صالح للمصدر الخارجي",
        variant: "destructive",
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const success = await syncWithRemoteSource(remoteUrl);
      
      if (success) {
        // تحديث وقت آخر مزامنة
        const config = getRemoteConfig();
        if (config) {
          setLastSync(config.lastSync);
        }
        
        toast({
          title: "تمت المزامنة",
          description: "تم تحديث البيانات من المصدر الخارجي بنجاح",
        });
      } else {
        toast({
          title: "فشلت المزامنة",
          description: "حدث خطأ أثناء تحديث البيانات",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالمصدر الخارجي",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    remoteUrl,
    setRemoteUrl,
    lastSync,
    isSyncing,
    handleSaveConfig,
    handleSyncNow
  };
};
