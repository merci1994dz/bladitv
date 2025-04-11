
/**
 * خدمة المزامنة الموحدة المحسنة
 * Enhanced unified sync service
 */

import { setSyncActive } from '../status';
import { setSyncError, clearSyncError, displaySyncError } from '../status/errorHandling';
import { setSyncTimestamp } from '../status/timestamp';
import { setIsSyncing } from '../../dataStore';
import { toast } from '@/hooks/use-toast';
import { syncWithSupabase } from '../supabaseSync';
import { syncWithBladiInfo } from '../remoteSync';

interface SyncOptions {
  source?: string;
  forceRefresh?: boolean;
  showNotifications?: boolean;
  preventDuplicates?: boolean;
  onComplete?: (success: boolean) => void;
}

/**
 * مزامنة موحدة محسنة لجميع مصادر البيانات
 * Enhanced unified sync for all data sources
 */
export const syncDataUnified = async (options: SyncOptions = {}): Promise<boolean> => {
  const {
    source,
    forceRefresh = false,
    showNotifications = true,
    preventDuplicates = true,
    onComplete
  } = options;
  
  // وضع التطبيق في حالة المزامنة
  setSyncActive(true);
  setIsSyncing(true);
  
  // إظهار إشعار البدء إذا تم طلبه
  if (showNotifications) {
    toast({
      title: "جاري المزامنة",
      description: "جاري تحديث البيانات من المصادر المتاحة..."
    });
  }
  
  try {
    let syncSuccess = false;
    
    // إذا تم تحديد مصدر معين
    if (source) {
      console.log(`محاولة المزامنة مع المصدر المحدد: ${source}`);
      
      // استخدام مزامنة Supabase إذا كان المصدر هو supabase
      if (source === 'supabase') {
        syncSuccess = await syncWithSupabase(forceRefresh);
      } 
      // استخدام مزامنة Bladi Info إذا كان المصدر هو bladi
      else if (source === 'bladi') {
        syncSuccess = await syncWithBladiInfo(forceRefresh);
      }
      // استخدام المزامنة الموحدة للمصادر الأخرى
      else {
        console.log('استخدام المزامنة الموحدة للمصدر المحدد');
        syncSuccess = await attemptAllSyncMethods(forceRefresh, preventDuplicates);
      }
    } else {
      // محاولة جميع طرق المزامنة المتاحة
      syncSuccess = await attemptAllSyncMethods(forceRefresh, preventDuplicates);
    }
    
    // إذا نجحت المزامنة
    if (syncSuccess) {
      // تحديث وقت آخر مزامنة ومسح أي أخطاء سابقة
      setSyncTimestamp();
      clearSyncError();
      
      // إظهار إشعار النجاح إذا تم طلبه
      if (showNotifications) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث البيانات بنجاح"
        });
      }
      
      // استدعاء وظيفة الاكتمال مع النجاح
      if (onComplete) {
        onComplete(true);
      }
      
      return true;
    } else {
      // إظهار إشعار الفشل إذا تم طلبه
      if (showNotifications) {
        toast({
          title: "تعذرت المزامنة",
          description: "لم يتم العثور على تحديثات جديدة أو فشلت جميع مصادر المزامنة",
          variant: "destructive"
        });
      }
      
      // استدعاء وظيفة الاكتمال مع الفشل
      if (onComplete) {
        onComplete(false);
      }
      
      return false;
    }
  } catch (error) {
    // معالجة الأخطاء وتسجيلها
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('خطأ في عملية المزامنة الموحدة:', error);
    
    // تعيين خطأ المزامنة
    setSyncError(errorMessage);
    
    // إظهار إشعار الخطأ إذا تم طلبه
    if (showNotifications) {
      displaySyncError(errorMessage);
    }
    
    // استدعاء وظيفة الاكتمال مع الفشل
    if (onComplete) {
      onComplete(false);
    }
    
    return false;
  } finally {
    // إلغاء تنشيط حالة المزامنة بغض النظر عن النتيجة
    setSyncActive(false);
    setIsSyncing(false);
  }
};

/**
 * محاولة جميع طرق المزامنة المتاحة بترتيب الأولوية
 * Attempt all available sync methods in priority order
 */
async function attemptAllSyncMethods(forceRefresh: boolean, preventDuplicates: boolean): Promise<boolean> {
  console.log('محاولة المزامنة مع جميع المصادر المتاحة...');
  
  try {
    // 1. أولاً محاولة المزامنة مع Supabase (أعلى أولوية)
    console.log('محاولة المزامنة مع Supabase...');
    const supabaseResult = await syncWithSupabase(forceRefresh);
    
    if (supabaseResult) {
      console.log('تمت المزامنة بنجاح مع Supabase');
      return true;
    }
    
    console.log('فشلت المزامنة مع Supabase، محاولة المزامنة مع Bladi Info...');
    
    // 2. ثم محاولة المزامنة مع Bladi Info
    const bladiResult = await syncWithBladiInfo(forceRefresh);
    
    if (bladiResult) {
      console.log('تمت المزامنة بنجاح مع Bladi Info');
      return true;
    }
    
    console.log('فشلت جميع محاولات المزامنة');
    return false;
  } catch (error) {
    console.error('خطأ أثناء محاولة المزامنة مع المصادر المتاحة:', error);
    return false;
  }
}
