
/**
 * الخدمة الموحدة للمزامنة
 * Unified sync service
 */

import { syncWithBladiInfo } from '../remoteSync';
import { syncWithSupabase } from '../supabaseSync';
import { syncWithRemoteSource } from '../remote/sync/syncWithRemote';
import { checkBladiInfoAvailability } from '../remote/sync/sourceAvailability';
import { setSyncTimestamp } from '../status/timestamp';
import { toast } from '@/hooks/use-toast';

// خيارات المزامنة
interface SyncOptions {
  forceRefresh?: boolean;
  showNotifications?: boolean;
  preventDuplicates?: boolean;
  onComplete?: (success: boolean) => void;
}

/**
 * مزامنة البيانات بشكل موحد باستخدام جميع المصادر المتاحة
 * Synchronize data using all available sources
 */
export const syncDataUnified = async (options: SyncOptions = {}): Promise<boolean> => {
  const {
    forceRefresh = false,
    showNotifications = true,
    preventDuplicates = true,
    onComplete
  } = options;
  
  try {
    if (showNotifications) {
      toast({
        title: "جاري المزامنة",
        description: "جاري تحديث البيانات من المصادر المتاحة...",
        duration: 3000
      });
    }
    
    // 1. أولاً، محاولة المزامنة مع Supabase
    try {
      const supabaseResult = await syncWithSupabase(forceRefresh);
      
      if (supabaseResult) {
        setSyncTimestamp();
        
        if (showNotifications) {
          toast({
            title: "تمت المزامنة بنجاح",
            description: "تم تحديث البيانات من Supabase",
            duration: 3000
          });
        }
        
        if (onComplete) onComplete(true);
        return true;
      }
    } catch (error) {
      console.warn('فشلت المزامنة مع Supabase، متابعة مع المصادر الأخرى:', error);
    }
    
    // 2. محاولة المزامنة مع Bladi Info
    try {
      const bladiResult = await syncWithBladiInfo(forceRefresh, { preventDuplicates });
      
      if (bladiResult.updated) {
        setSyncTimestamp();
        
        if (showNotifications) {
          toast({
            title: "تمت المزامنة بنجاح",
            description: `تم تحديث البيانات وإضافة ${bladiResult.channelsCount} قناة جديدة`,
            duration: 3000
          });
        }
        
        if (onComplete) onComplete(true);
        return true;
      }
    } catch (error) {
      console.warn('فشلت المزامنة مع Bladi Info، محاولة استخدام المصادر المباشرة:', error);
    }
    
    // 3. محاولة المزامنة المباشرة مع المصادر
    try {
      const availableSource = await checkBladiInfoAvailability();
      
      if (availableSource) {
        const syncResult = await syncWithRemoteSource(availableSource, forceRefresh);
        
        if (syncResult) {
          setSyncTimestamp();
          
          if (showNotifications) {
            toast({
              title: "تمت المزامنة بنجاح",
              description: `تم تحديث البيانات من ${availableSource}`,
              duration: 3000
            });
          }
          
          if (onComplete) onComplete(true);
          return true;
        }
      }
    } catch (error) {
      console.error('فشلت جميع محاولات المزامنة:', error);
    }
    
    // إذا وصلنا إلى هنا، فإن جميع المحاولات قد فشلت
    if (showNotifications) {
      toast({
        title: "فشلت المزامنة",
        description: "تعذر الاتصال بمصادر البيانات. تأكد من اتصالك بالإنترنت.",
        variant: "destructive",
        duration: 5000
      });
    }
    
    if (onComplete) onComplete(false);
    return false;
  } catch (error) {
    console.error('خطأ غير متوقع في المزامنة الموحدة:', error);
    
    if (showNotifications) {
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ غير متوقع أثناء المزامنة.",
        variant: "destructive",
        duration: 5000
      });
    }
    
    if (onComplete) onComplete(false);
    return false;
  }
};
