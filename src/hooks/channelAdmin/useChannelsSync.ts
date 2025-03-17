
import { useToast } from '@/hooks/use-toast';
import { publishChannelsToAllUsers, forceBroadcastToAllBrowsers } from '@/services/sync';
import { BLADI_INFO_SOURCES } from '@/services/sync/remote/sync/sources';

/**
 * Hook for handling channel synchronization
 */
export const useChannelsSync = (refetchChannels: () => Promise<any>) => {
  const { toast } = useToast();
  
  // وظيفة مزامنة القنوات يدويًا وضمان نشرها للمستخدمين
  const manualSyncChannels = async (): Promise<void> => {
    toast({
      title: "جاري النشر",
      description: "جاري نشر القنوات للمستخدمين...",
    });
    
    try {
      // استخدام البث القوي لضمان وصول التحديث لجميع المتصفحات
      const broadcastResult = await forceBroadcastToAllBrowsers();
      
      if (!broadcastResult) {
        // محاولة استخدام الطريقة العادية إذا فشل البث القوي
        await publishChannelsToAllUsers();
      }
      
      // تحديث البيانات في واجهة المستخدم
      await refetchChannels();
      
      console.log("تم نشر القنوات للمستخدمين");
      
      toast({
        title: "تم النشر",
        description: "تم نشر القنوات بنجاح للمستخدمين",
      });
      
      // محاولة إعادة تحميل الصفحة بعد فترة قصيرة
      setTimeout(() => {
        try {
          window.location.reload();
        } catch (e) {
          console.error('فشل في إعادة تحميل الصفحة:', e);
        }
      }, 2000);
    } catch (error) {
      console.error('خطأ في نشر القنوات:', error);
      
      toast({
        title: "خطأ في النشر",
        description: "حدث خطأ أثناء نشر القنوات للمستخدمين، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
  // وظيفة جديدة للحصول على الروابط المرتبطة بالمشروع
  const getProjectLinks = (): { name: string; url: string; description: string }[] => {
    return [
      {
        name: "بلادي تي في - الموقع الرسمي",
        url: "https://bladitv.lovable.app",
        description: "موقع البث الرسمي"
      },
      {
        name: "لوحة الإدارة",
        url: "/admin",
        description: "إدارة القنوات والإعدادات"
      },
      ...BLADI_INFO_SOURCES.map((source) => ({
        name: new URL(source).hostname,
        url: source,
        description: "مصدر قنوات"
      })),
      {
        name: "اتصل بنا",
        url: "mailto:bladitvapp@gmail.com",
        description: "للدعم الفني"
      }
    ];
  };
  
  return {
    manualSyncChannels,
    getProjectLinks
  };
};
