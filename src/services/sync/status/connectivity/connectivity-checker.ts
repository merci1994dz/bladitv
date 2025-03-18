
/**
 * وحدة مخصصة للتحقق من حالة الاتصال
 * Specialized module for connectivity checking
 */

import { supabase } from '@/integrations/supabase/client';

// تخزين آخر نتيجة للتحقق من الاتصال وتاريخها
let lastConnectivityCheck: {
  result: { hasInternet: boolean; hasServerAccess: boolean };
  timestamp: number;
} | null = null;

// مدة صلاحية الذاكرة التخزينية (30 ثانية)
const CACHE_VALIDITY_DURATION = 30 * 1000;

/**
 * التحقق من حالة الاتصال بالإنترنت والخوادم
 * Check internet and server connectivity status
 */
export const checkConnectivityIssues = async (): Promise<{
  hasInternet: boolean;
  hasServerAccess: boolean;
}> => {
  // التحقق من وجود اتصال بالإنترنت
  const isOnline = navigator.onLine;
  
  // إذا لم يكن هناك اتصال بالإنترنت، لا حاجة للتحقق من الوصول إلى الخادم
  if (!isOnline) {
    return { hasInternet: false, hasServerAccess: false };
  }
  
  // استخدام النتائج المخزنة مؤقتًا إذا كانت حديثة
  if (lastConnectivityCheck && Date.now() - lastConnectivityCheck.timestamp < CACHE_VALIDITY_DURATION) {
    console.log('استخدام نتائج التحقق من الاتصال المخزنة مؤقتًا');
    return lastConnectivityCheck.result;
  }
  
  // التحقق من القدرة على الوصول إلى خادم Supabase
  try {
    console.log('التحقق من الوصول إلى خادم Supabase...');
    
    // استخدام استعلام بسيط مع تنفيذ خاص للمهلة الزمنية
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // استخدام استعلام بسيط للتحقق من الاتصال
    const { data, error } = await supabase
      .from('channels')
      .select('count', { count: 'exact', head: true });
    
    clearTimeout(timeoutId);
    
    const hasServerAccess = !error;
    
    // تخزين النتائج للاستخدام اللاحق
    lastConnectivityCheck = {
      result: { hasInternet: true, hasServerAccess },
      timestamp: Date.now()
    };
    
    console.log('نتائج التحقق من الاتصال:', { hasInternet: true, hasServerAccess });
    return { hasInternet: true, hasServerAccess };
  } catch (error) {
    console.error('خطأ في التحقق من الوصول إلى الخادم:', error);
    
    // تخزين النتائج للاستخدام اللاحق
    lastConnectivityCheck = {
      result: { hasInternet: true, hasServerAccess: false },
      timestamp: Date.now()
    };
    
    return { hasInternet: true, hasServerAccess: false };
  }
};

/**
 * إعادة تعيين ذاكرة التخزين المؤقت للتحقق من الاتصال
 * Reset connectivity check cache
 */
export const resetConnectivityCache = (): void => {
  lastConnectivityCheck = null;
};
