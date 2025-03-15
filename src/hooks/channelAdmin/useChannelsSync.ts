
import { useToast } from '@/hooks/use-toast';
import { publishChannelsToAllUsers } from '@/services/sync';
import { syncWithRemoteSource } from '@/services/sync/remote';

/**
 * Hook for handling channel synchronization
 */
export const useChannelsSync = (refetchChannels: () => Promise<any>) => {
  const { toast } = useToast();
  
  // وظيفة مزامنة القنوات يدويًا وضمان نشرها للمستخدمين
  const manualSyncChannels = async (): Promise<void> => {
    toast({
      title: "جاري المزامنة",
      description: "جاري تحديث قائمة القنوات ونشرها للمستخدمين...",
    });
    
    try {
      // إضافة رمز عشوائي لتجنب التخزين المؤقت بشكل كامل (مهم للاستضافات)
      const cacheBuster = `?_=${Date.now()}&nocache=${Math.random()}`;
      const syncUrl = `https://bladi-info.com/api/channels.json${cacheBuster}`;
      
      console.log('بدء التزامن مع موقع bladi-info.com على الرابط:', syncUrl);
      
      // محاولة المزامنة مع bladi-info.com
      const success = await syncWithRemoteSource(syncUrl, true);
      
      if (!success) {
        throw new Error('فشلت عملية المزامنة مع bladi-info.com');
      }
      
      // نشر التغييرات مع إجبار إعادة تحميل الصفحة
      await publishChannelsToAllUsers();
      
      // تحديث البيانات في واجهة المستخدم
      await refetchChannels();
      
      console.log("تمت المزامنة بنجاح مع bladi-info.com ونشر القنوات للمستخدمين");
      
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث القنوات بنجاح من bladi-info.com ونشرها للمستخدمين",
      });
    } catch (error) {
      console.error('خطأ في مزامنة القنوات:', error);
      
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء مزامنة القنوات مع bladi-info.com، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
  // وظيفة مزامنة القنوات من bladi-info.com فقط
  const syncFromBladiInfo = async (): Promise<void> => {
    toast({
      title: "جاري التزامن",
      description: "جاري التزامن مع bladi-info.com...",
    });
    
    try {
      // إضافة رمز عشوائي لتجنب التخزين المؤقت
      const cacheBuster = `?_=${Date.now()}&r=${Math.random()}`;
      const url = `https://bladi-info.com/api/channels.json${cacheBuster}`;
      
      console.log('التزامن المباشر مع bladi-info.com على الرابط:', url);
      
      // إضافة معلمات إضافية للتوافق مع بعض الاستضافات
      const success = await syncWithRemoteSource(url, true);
      
      if (success) {
        // تحديث البيانات في واجهة المستخدم
        await refetchChannels();
        
        toast({
          title: "تم التزامن",
          description: "تم التزامن بنجاح مع bladi-info.com وتحديث القنوات",
        });
      } else {
        throw new Error("فشل التزامن مع bladi-info.com");
      }
    } catch (error) {
      console.error('خطأ في التزامن مع bladi-info.com:', error);
      
      toast({
        title: "خطأ في التزامن",
        description: "حدث خطأ أثناء التزامن مع bladi-info.com، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
  return {
    manualSyncChannels,
    syncFromBladiInfo
  };
};
