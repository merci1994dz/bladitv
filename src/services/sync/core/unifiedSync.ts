
/**
 * آلية المزامنة الموحدة - تقليل التكرار وتحسين الأداء
 * Unified synchronization mechanism - reducing duplication and improving performance
 */

import { toast } from '@/hooks/use-toast';
import { channels, countries, categories, setIsSyncing } from '../../dataStore';
import { updateLastSyncTime } from '../config';
import { setSyncActive } from '../status';
import { isSyncLocked, setSyncLock, releaseSyncLock } from '../lock';
import { isRunningOnVercel } from '../remote/fetch/skewProtection';

// وظيفة للتعامل مع مهلة العمليات
// Function to handle operation timeouts
const withTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> => {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`تجاوز العملية للوقت المحدد: ${operationName}`)), timeoutMs);
    })
  ]);
};

// كائن لتخزين حالة المزامنة
// Object to store sync state
const syncStatus = {
  lastSyncTime: 0,
  syncCount: 0,
  failedAttempts: 0,
  isCurrentlySyncing: false
};

/**
 * وظيفة مزامنة موحدة مع Supabase
 * Unified sync function with Supabase
 */
export const syncWithSupabaseUnified = async (forceRefresh: boolean = false): Promise<boolean> => {
  console.log('بدء المزامنة الموحدة مع Supabase، التحديث الإجباري = ', forceRefresh);
  
  // التحقق من وجود قفل مزامنة نشط
  // Check for active sync lock
  if (isSyncLocked()) {
    console.log('هناك عملية مزامنة قيد التنفيذ بالفعل، تجاهل الطلب الحالي');
    return false;
  }
  
  // الحد من تكرار المزامنة في فترة زمنية قصيرة
  // Limit sync frequency in a short time period
  const now = Date.now();
  const timeSinceLastSync = now - syncStatus.lastSyncTime;
  
  if (timeSinceLastSync < 5000 && !forceRefresh) {
    console.log('تم طلب المزامنة مؤخرًا، تجاهل الطلب الحالي');
    return false;
  }
  
  // تعيين أقفال وحالات المزامنة
  // Set sync locks and states
  setSyncLock('unified-sync');
  setIsSyncing(true);
  setSyncActive(true);
  syncStatus.isCurrentlySyncing = true;
  
  try {
    // تعديل مهلة التنفيذ حسب البيئة
    // Adjust execution timeout based on environment
    const isOnVercel = isRunningOnVercel();
    const executionTimeout = isOnVercel ? 30000 : 20000;
    
    // استدعاء supabase للحصول على البيانات
    // Call supabase to get data
    const { supabase } = await import('@/integrations/supabase/client');
    
    // الحصول على البيانات مع مهلة زمنية محددة
    // Get data with specified timeout
    const [channelsData, countriesData, categoriesData] = await Promise.all([
      withTimeout(supabase.from('channels').select('*').order('id').then(res => res.data || []), 
        executionTimeout, 'جلب القنوات'),
      withTimeout(supabase.from('countries').select('*').order('id').then(res => res.data || []), 
        executionTimeout, 'جلب الدول'),
      withTimeout(supabase.from('categories').select('*').order('id').then(res => res.data || []), 
        executionTimeout, 'جلب الفئات')
    ]);
    
    // تحقق من صحة البيانات
    // Check data validity
    if (!channelsData.length && !countriesData.length && !categoriesData.length) {
      console.warn('لم يتم استلام أي بيانات من Supabase');
      return false;
    }
    
    console.log('تم استلام البيانات من Supabase:', {
      channels: channelsData.length,
      countries: countriesData.length,
      categories: categoriesData.length
    });
    
    // تحديث البيانات في الذاكرة
    // Update data in memory
    channels.value = channelsData;
    countries.value = countriesData;
    categories.value = categoriesData;
    
    // حفظ البيانات في التخزين المحلي
    // Save data in local storage
    try {
      localStorage.setItem('channels', JSON.stringify(channelsData));
      localStorage.setItem('countries', JSON.stringify(countriesData));
      localStorage.setItem('categories', JSON.stringify(categoriesData));
    } catch (e) {
      console.warn('فشل في حفظ البيانات في التخزين المحلي:', e);
    }
    
    // تحديث علامات الوقت والإصدار
    // Update timestamps and version
    const timestamp = Date.now().toString();
    updateLastSyncTime();
    
    try {
      localStorage.setItem('data_version', timestamp);
      localStorage.setItem('supabase_sync_version', timestamp);
      localStorage.setItem('supabase_sync_success', 'true');
      localStorage.setItem('last_update_check', timestamp);
      
      // إرسال أحداث لإعلام المتصفح بالتحديث
      // Send events to notify the browser of the update
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('app_data_updated'));
    } catch (e) {
      console.warn('فشل في تعيين علامات التحديث في التخزين المحلي:', e);
    }
    
    // تحديث حالة المزامنة
    // Update sync status
    syncStatus.lastSyncTime = now;
    syncStatus.syncCount++;
    syncStatus.failedAttempts = 0;
    
    console.log('تمت المزامنة الموحدة مع Supabase بنجاح');
    return true;
  } catch (error) {
    // معالجة الأخطاء
    // Error handling
    console.error('خطأ في المزامنة الموحدة مع Supabase:', error);
    
    syncStatus.failedAttempts++;
    
    // عرض إشعار للمستخدم فقط في حالة الفشل المتكرر
    // Show notification to the user only in case of repeated failures
    if (syncStatus.failedAttempts > 1) {
      try {
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر الاتصال بقاعدة البيانات. سيتم استخدام البيانات المحلية.",
          variant: "destructive",
        });
      } catch (e) {
        // تجاهل أخطاء عرض الإشعارات
        // Ignore notification display errors
      }
    }
    
    return false;
  } finally {
    // تحرير الأقفال وإعادة تعيين الحالات
    // Release locks and reset states
    releaseSyncLock('unified-sync');
    setIsSyncing(false);
    setSyncActive(false);
    syncStatus.isCurrentlySyncing = false;
  }
};

/**
 * وظيفة مزامنة موحدة للاستخدام العام
 * General-purpose unified sync function
 */
export const syncDataUnified = async (options: {
  forceRefresh?: boolean;
  showNotifications?: boolean;
} = {}): Promise<boolean> => {
  const { forceRefresh = false, showNotifications = true } = options;
  
  // عرض إشعار بدء المزامنة
  // Show sync start notification
  if (showNotifications) {
    try {
      toast({
        title: "جاري المزامنة",
        description: "جاري تحديث البيانات...",
      });
    } catch (e) {
      // تجاهل أخطاء عرض الإشعارات
      // Ignore notification display errors
    }
  }
  
  try {
    const result = await syncWithSupabaseUnified(forceRefresh);
    
    // عرض إشعار نجاح المزامنة
    // Show sync success notification
    if (result && showNotifications) {
      try {
        toast({
          title: "تمت المزامنة",
          description: "تم تحديث البيانات بنجاح",
        });
      } catch (e) {
        // تجاهل أخطاء عرض الإشعارات
        // Ignore notification display errors
      }
    }
    
    return result;
  } catch (error) {
    console.error('خطأ في مزامنة البيانات الموحدة:', error);
    
    // عرض إشعار فشل المزامنة
    // Show sync failure notification
    if (showNotifications) {
      try {
        toast({
          title: "فشل في المزامنة",
          description: "حدث خطأ أثناء تحديث البيانات",
          variant: "destructive",
        });
      } catch (e) {
        // تجاهل أخطاء عرض الإشعارات
        // Ignore notification display errors
      }
    }
    
    return false;
  }
};

/**
 * وظيفة للتحقق من حالة المزامنة الحالية
 * Function to check current sync state
 */
export const getSyncStatus = () => {
  return {
    isCurrentlySyncing: syncStatus.isCurrentlySyncing,
    lastSyncTime: syncStatus.lastSyncTime > 0 ? new Date(syncStatus.lastSyncTime).toISOString() : null,
    syncCount: syncStatus.syncCount,
    failedAttempts: syncStatus.failedAttempts
  };
};
