
/**
 * وظائف التحقق من اتصال Supabase
 * Supabase connection checking functions
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * التحقق من اتصال Supabase
 * Check Supabase connection
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // محاولة جلب إحصائيات الجداول لفحص الاتصال
    const stats = await getSupabaseTableStats();
    return !!stats;
  } catch (error) {
    console.error('خطأ في التحقق من اتصال Supabase:', error);
    return false;
  }
};

/**
 * الحصول على إحصائيات جداول Supabase
 * Get Supabase table statistics
 */
export const getSupabaseTableStats = async (): Promise<any> => {
  try {
    // جلب عدد السجلات في جدول القنوات
    const { count: channelsCount, error: channelsError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true });
    
    if (channelsError) {
      throw channelsError;
    }
    
    // جلب عدد السجلات في جدول البلدان
    const { count: countriesCount, error: countriesError } = await supabase
      .from('countries')
      .select('*', { count: 'exact', head: true });
    
    if (countriesError) {
      throw countriesError;
    }
    
    // جلب عدد السجلات في جدول الفئات
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    return {
      channels: channelsCount,
      countries: countriesCount,
      categories: categoriesCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات جداول Supabase:', error);
    throw error;
  }
};
