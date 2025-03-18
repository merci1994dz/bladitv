
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

// تحسين عملية المزامنة مع Supabase بإضافة آلية الذاكرة المؤقتة والاتصال المحسن
const CONNECTION_TIMEOUT = 10000; // 10 ثوانٍ كحد أقصى للاتصال
let lastCheckTime = 0;
let connectionCache: { isConnected: boolean; timestamp: number } | null = null;

/**
 * التحقق من الاتصال بـ Supabase بطريقة محسنة مع ذاكرة مؤقتة
 * Enhanced connection check with caching
 */
async function checkSupabaseConnection(): Promise<boolean> {
  const now = Date.now();
  
  // استخدام الذاكرة المؤقتة إذا كانت حديثة (أقل من 30 ثانية)
  if (connectionCache && now - connectionCache.timestamp < 30000) {
    return connectionCache.isConnected;
  }
  
  try {
    // استخدام طلب خفيف للتحقق من الاتصال
    const connectionPromise = supabase.from('channels').select('count', { count: 'exact', head: true });
    
    // إضافة مهلة زمنية لتجنب الانتظار الطويل
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), CONNECTION_TIMEOUT);
    });
    
    // استخدام السباق للتحقق من الاتصال مع مهلة زمنية
    const result = await Promise.race([
      connectionPromise.then(() => true),
      timeoutPromise
    ]);
    
    // تخزين نتيجة الاتصال في الذاكرة المؤقتة
    connectionCache = { isConnected: result, timestamp: now };
    return result;
  } catch (error) {
    console.error("خطأ في التحقق من الاتصال بـ Supabase:", error);
    connectionCache = { isConnected: false, timestamp: now };
    return false;
  }
}

/**
 * مزامنة البيانات مع Supabase
 * Synchronize data with Supabase
 */
export async function syncWithSupabase(forceRefresh: boolean = false): Promise<boolean> {
  console.log('بدء المزامنة مع Supabase، التحديث الإجباري = / Starting sync with Supabase, force refresh =', forceRefresh);
  
  // التحقق من الاتصال أولاً قبل محاولة المزامنة
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.warn('تعذر الاتصال بـ Supabase، تخطي المزامنة');
    return false;
  }
  
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

// تحسين آلية المزامنة في الوقت الحقيقي
let realtimeSubscription: ReturnType<typeof supabase.channel> | null = null;

/**
 * إعداد المزامنة في الوقت الحقيقي مع Supabase
 * Set up real-time sync with Supabase
 */
export function setupRealtimeSync(): () => void {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase / Setting up real-time sync with Supabase');
  
  try {
    // تنظيف أي اشتراك سابق
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }
    
    // إنشاء قناة واحدة للاستماع لتغييرات متعددة
    realtimeSubscription = supabase
      .channel('supabase_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' }, 
        payload => {
          console.log('تم استلام تغيير في قناة في الوقت الحقيقي: / Received real-time channel change:', payload);
        })
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'settings' }, 
        payload => {
          console.log('تم استلام تغيير في الإعدادات في الوقت الحقيقي: / Received real-time settings change:', payload);
        })
      .subscribe((status) => {
        console.log('حالة الاشتراك في الوقت الحقيقي: / Realtime subscription status:', status);
      });
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
        realtimeSubscription = null;
      }
    };
  } catch (error) {
    handleError(error, 'إعداد المزامنة في الوقت الحقيقي / Setting up real-time sync');
    // إرجاع دالة فارغة في حالة الخطأ
    return () => {};
  }
}

// تصدير دالة تهيئة Supabase
// Export Supabase initialization function
export { initializeSupabaseTables };
