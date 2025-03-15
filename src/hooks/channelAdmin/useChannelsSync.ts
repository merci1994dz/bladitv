
import { useToast } from '@/hooks/use-toast';
import { publishChannelsToAllUsers } from '@/services/sync';

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
      // نشر التغييرات مع إجبار إعادة تحميل الصفحة
      await publishChannelsToAllUsers();
      
      // تحديث البيانات في واجهة المستخدم
      await refetchChannels();
      
      console.log("تم نشر القنوات للمستخدمين");
      
      toast({
        title: "تم النشر",
        description: "تم نشر القنوات بنجاح للمستخدمين",
      });
    } catch (error) {
      console.error('خطأ في نشر القنوات:', error);
      
      toast({
        title: "خطأ في النشر",
        description: "حدث خطأ أثناء نشر القنوات للمستخدمين، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
  return {
    manualSyncChannels
  };
};
