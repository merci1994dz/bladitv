
import { syncChannels } from '../sync';
import { checkBladiInfoAvailability } from '../remote/sync/sourceAvailability';
import { syncWithRemoteSource } from '../remote/sync/syncWithRemote';
import { checkConnectivityIssues } from '../status/connectivity';
import { setSyncTimestamp } from '../status/timestamp';
import { toast } from '@/hooks/use-toast';

/**
 * واجهة موحدة للمزامنة تقوم باختيار الطريقة المناسبة تلقائيًا
 * A unified sync interface that automatically chooses the appropriate sync method
 */
export const syncDataUnified = async (options: {
  forceRefresh?: boolean;
  showNotifications?: boolean;
  preventDuplicates?: boolean;
}): Promise<boolean> => {
  const { 
    forceRefresh = false, 
    showNotifications = true,
    preventDuplicates = true
  } = options;
  
  try {
    // التحقق من وجود اتصال بالإنترنت أولاً
    // First check if there is an internet connection
    const { hasInternet, hasServerAccess } = await checkConnectivityIssues();
    
    if (!hasInternet) {
      if (showNotifications) {
        toast({
          title: "لا يوجد اتصال بالإنترنت",
          description: "تعذرت المزامنة. يرجى التحقق من اتصالك بالإنترنت.",
          variant: "destructive"
        });
      }
      return false;
    }
    
    // البحث عن مصدر متاح
    // Find an available source
    const availableSource = await checkBladiInfoAvailability();
    
    if (availableSource) {
      // المزامنة مع المصدر المتاح
      // Sync with available source
      const syncResult = await syncWithRemoteSource(availableSource, forceRefresh);
      
      if (syncResult) {
        // تحديث وقت آخر مزامنة
        // Update last sync time
        setSyncTimestamp();
        
        if (showNotifications) {
          toast({
            title: "تمت المزامنة بنجاح",
            description: "تم تحديث البيانات من المصدر المتاح"
          });
        }
        
        return true;
      }
    }
    
    // إذا فشلت المزامنة مع المصدر الأساسي، استخدم واجهة المزامنة العادية
    // If sync failed with primary source, use regular sync interface
    const regularSyncResult = await syncChannels(forceRefresh);
    
    if (regularSyncResult) {
      if (showNotifications) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث البيانات باستخدام واجهة المزامنة العادية"
        });
      }
      
      return true;
    }
    
    // إذا فشلت جميع محاولات المزامنة
    // If all sync attempts failed
    if (showNotifications) {
      toast({
        title: "تعذرت المزامنة",
        description: "فشلت جميع محاولات المزامنة. يرجى المحاولة مرة أخرى لاحقًا.",
        variant: "destructive"
      });
    }
    
    return false;
  } catch (error) {
    console.error("خطأ في المزامنة الموحدة:", error);
    
    if (showNotifications) {
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ غير متوقع أثناء المزامنة",
        variant: "destructive"
      });
    }
    
    return false;
  }
};
