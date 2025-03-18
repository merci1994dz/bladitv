
/**
 * عمليات المزامنة مع Supabase
 * Supabase synchronization operations
 */

import { supabase } from '@/integrations/supabase/client';
import { initializeSupabaseTables } from './supabase/initialize';
import { executeRetryableSync } from './core/retryableSync';
import { handleError } from '@/utils/errorHandling';
import { syncAllData } from './core/syncOperations';
import { setSyncTimestamp } from '@/services/sync/status/timestamp';
import { loadFromLocalStorage } from '@/services/dataStore/storage';

// تتبع آخر وقت تم فيه ربط الاتصال بـ Supabase بنجاح
// Track the last time a connection to Supabase was successful
let lastSuccessfulConnection = 0;
// تأخير التحقق (5 دقائق)
const CONNECTION_CHECK_DELAY = 5 * 60 * 1000;

/**
 * التحقق من الاتصال بـ Supabase
 * Check connection to Supabase
 */
const checkSupabaseConnection = async (): Promise<boolean> => {
  // إذا تم التحقق مؤخرًا، استخدم القيمة المخزنة
  // If checked recently, use cached value
  if (Date.now() - lastSuccessfulConnection < CONNECTION_CHECK_DELAY) {
    return true;
  }
  
  try {
    // التحقق من الاتصال بـ Supabase
    // Check connection to Supabase
    const { data, error } = await supabase.from('channels').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    // تحديث آخر وقت للاتصال الناجح
    lastSuccessfulConnection = Date.now();
    return true;
  } catch (error) {
    console.error("فشل التحقق من الاتصال بـ Supabase:", error);
    return false;
  }
};

/**
 * مزامنة البيانات مع Supabase
 * Synchronize data with Supabase
 */
export async function syncWithSupabase(forceRefresh: boolean = false): Promise<boolean> {
  console.log('بدء المزامنة مع Supabase، التحديث الإجباري = / Starting sync with Supabase, force refresh =', forceRefresh);
  
  // التحقق من وجود اتصال بـ Supabase قبل محاولة المزامنة
  // Check if Supabase is accessible before attempting sync
  const isConnected = await checkSupabaseConnection();
  
  if (!isConnected) {
    console.log('لا يوجد اتصال بـ Supabase، استخدام البيانات المحلية / No connection to Supabase, using local data');
    // تحميل البيانات من التخزين المحلي بدلاً من ذلك
    // Load data from local storage instead
    return loadFromLocalStorage();
  }
  
  // تنفيذ المزامنة مع آلية إعادة المحاولة
  // Execute sync with retry mechanism
  const result = await executeRetryableSync(
    async () => {
      try {
        // إذا نجح الاتصال، قم بتنفيذ المزامنة الكاملة
        // If connection successful, execute full sync
        const syncResult = await syncAllData(forceRefresh);
        
        if (syncResult) {
          setSyncTimestamp(new Date().toISOString());
        }
        
        return syncResult;
      } catch (error) {
        handleError(error, 'مزامنة Supabase / Supabase sync');
        throw error;
      }
    },
    'المزامنة مع Supabase / Sync with Supabase',
    true // عملية حرجة / Critical operation
  );
  
  return result || false;
}

// معرّف للاشتراك في الوقت الحقيقي
// Real-time subscription identifier
let realtimeSubscription: any = null;

/**
 * إعداد المزامنة في الوقت الحقيقي مع Supabase
 * Set up real-time sync with Supabase
 */
export function setupRealtimeSync(): () => void {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase / Setting up real-time sync with Supabase');
  
  // إذا كان هناك اشتراك موجود، قم بإلغائه أولاً
  // If there's an existing subscription, unsubscribe first
  if (realtimeSubscription) {
    console.log('إزالة الاشتراك في تحديثات الوقت الحقيقي');
    try {
      realtimeSubscription.unsubscribe();
      console.log('حالة الاشتراك في تحديثات الوقت الحقيقي:', realtimeSubscription.subscription.state);
    } catch (e) {
      console.error('خطأ في إزالة الاشتراك:', e);
    }
    realtimeSubscription = null;
  }
  
  try {
    // إنشاء قناة واحدة لجميع التغييرات (أكثر كفاءة)
    // Create one channel for all changes (more efficient)
    realtimeSubscription = supabase
      .channel('public:changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, payload => {
        console.log('تم استلام تغيير في قناة في الوقت الحقيقي: / Received real-time channel change:', payload);
        // محاولة مزامنة البيانات عند استلام التغييرات
        syncAllData(true).catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, payload => {
        console.log('تم استلام تغيير في الإعدادات في الوقت الحقيقي: / Received real-time settings change:', payload);
        // محاولة مزامنة البيانات عند استلام التغييرات
        syncAllData(true).catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries' }, payload => {
        console.log('تم استلام تغيير في البلدان في الوقت الحقيقي: / Received real-time countries change:', payload);
        // محاولة مزامنة البيانات عند استلام التغييرات
        syncAllData(true).catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, payload => {
        console.log('تم استلام تغيير في الفئات في الوقت الحقيقي: / Received real-time categories change:', payload);
        // محاولة مزامنة البيانات عند استلام التغييرات
        syncAllData(true).catch(console.error);
      })
      .subscribe(status => {
        console.log('حالة الاشتراك في تحديثات الوقت الحقيقي:', status);
      });
    
    // إرجاع دالة لإلغاء الاشتراك
    // Return function to unsubscribe
    return () => {
      if (realtimeSubscription) {
        console.log('إلغاء الاشتراك في تحديثات الوقت الحقيقي');
        realtimeSubscription.unsubscribe();
        realtimeSubscription = null;
      }
    };
  } catch (error) {
    handleError(error, 'إعداد المزامنة في الوقت الحقيقي / Setting up real-time sync');
    // إرجاع دالة فارغة في حالة الخطأ
    // Return empty function in case of error
    return () => {};
  }
}

// تصدير دالة تهيئة Supabase
// Export Supabase initialization function
export { initializeSupabaseTables };
