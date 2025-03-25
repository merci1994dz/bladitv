
/**
 * وظائف التحقق من الاتصال بـ Supabase
 * Supabase connection checking functions
 */

import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandling';
import { checkAndFixConnectionIssues } from './errorFixer';

/**
 * التحقق من الاتصال بـ Supabase
 * Check connection to Supabase
 * 
 * @param autoRepair محاولة إصلاح المشاكل تلقائياً
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح الاتصال
 */
export const checkSupabaseConnection = async (autoRepair: boolean = true): Promise<boolean> => {
  try {
    console.log("جاري التحقق من الاتصال بـ Supabase...");
    const startTime = Date.now();
    
    const { data, error } = await supabase.from('channels').select('count', { count: 'exact', head: true });
    
    const connectionTime = Date.now() - startTime;
    console.log(`زمن الاتصال بـ Supabase: ${connectionTime}ms`);
    
    if (error) {
      console.error('خطأ في الاتصال بـ Supabase:', error);
      
      // محاولة إصلاح المشكلة تلقائياً إذا تم تفعيل الخيار
      if (autoRepair) {
        console.log('جاري محاولة إصلاح مشكلة الاتصال تلقائياً...');
        const isFixed = await checkAndFixConnectionIssues();
        
        if (isFixed) {
          console.log('تم إصلاح مشكلة الاتصال بنجاح، جاري التحقق مرة أخرى...');
          // محاولة الاتصال مرة أخرى بعد الإصلاح
          return await checkSupabaseConnection(false);
        }
      }
      
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
    
    // إذا كان زمن الاتصال بطيئاً، سجل ذلك
    if (connectionTime > 1000) {
      console.warn(`الاتصال بـ Supabase بطيء (${connectionTime}ms)`);
    }
    
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

/**
 * فحص صحة جداول Supabase
 * Check Supabase tables health
 */
export const checkSupabaseTablesHealth = async (): Promise<Record<string, boolean>> => {
  const tablesHealth: Record<string, boolean> = {};
  const tables = ['channels', 'countries', 'categories', 'settings'];
  
  try {
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      tablesHealth[table] = !error;
      
      if (error) {
        console.error(`مشكلة في جدول ${table}:`, error.message);
      }
    }
    
    return tablesHealth;
  } catch (error) {
    console.error('خطأ أثناء فحص صحة جداول Supabase:', error);
    return tables.reduce((acc, table) => ({ ...acc, [table]: false }), {});
  }
};
