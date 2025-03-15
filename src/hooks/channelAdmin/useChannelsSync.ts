
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
      title: "جاري المزامنة",
      description: "جاري تحديث قائمة القنوات ونشرها للمستخدمين...",
    });
    
    try {
      // نشر التغييرات مع إجبار إعادة تحميل الصفحة
      await publishChannelsToAllUsers();
      
      // تحديث البيانات في واجهة المستخدم
      await refetchChannels();
      
      console.log("تمت المزامنة بنجاح ونشر القنوات للمستخدمين");
      
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث القنوات بنجاح ونشرها للمستخدمين",
      });
      
      // Changed from returning boolean to void
    } catch (error) {
      console.error('خطأ في مزامنة القنوات:', error);
      
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء مزامنة القنوات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      
      // No longer throwing the error to ensure void return type
    }
  };
  
  return {
    manualSyncChannels
  };
};
