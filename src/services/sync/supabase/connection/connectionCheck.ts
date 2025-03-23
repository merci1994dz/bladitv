
/**
 * وظائف التحقق من الاتصال بـ Supabase
 * Supabase connection checking functions
 */

import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandling';

/**
 * التحقق من الاتصال بـ Supabase
 * Check connection to Supabase
 * 
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح الاتصال
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("جاري التحقق من الاتصال بـ Supabase...");
    const { data, error } = await supabase.from('channels').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('خطأ في الاتصال بـ Supabase:', error);
      
      // محاولة تحديد سبب الخطأ
      if (error.code === 'PGRST301') {
        throw new Error('خطأ في مصادقة Supabase: ' + error.message);
      } else if (error.code?.includes('54')) {
        throw new Error('مهلة اتصال Supabase: ' + error.message);
      } else if (error.code === '23505' || error.message.includes('duplicate key')) {
        // معالجة خاصة لأخطاء المفاتيح المكررة
        throw new Error('خطأ المفتاح المكرر في Supabase: ' + error.message);
      } else {
        throw error;
      }
    }
    
    console.log("تم الاتصال بـ Supabase بنجاح.");
    return true;
  } catch (error) {
    handleError(error, 'التحقق من اتصال Supabase', false);
    return false;
  }
};

/**
 * الحصول على إحصائيات جداول Supabase
 * Get Supabase table statistics
 */
export const getSupabaseTableStats = async (): Promise<Record<string, number> | null> => {
  try {
    const tables = ['channels', 'countries', 'categories', 'settings'];
    const stats: Record<string, number> = {};
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.warn(`خطأ في الحصول على إحصائيات جدول ${table}:`, error);
        continue;
      }
      
      stats[table] = typeof data === 'object' && data !== null ? (data as any).count : 0;
    }
    
    return stats;
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات جداول Supabase:', error);
    return null;
  }
};
