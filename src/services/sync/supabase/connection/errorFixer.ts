
/**
 * أدوات إصلاح أخطاء اتصال Supabase
 * Supabase connection error fix utilities
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * إصلاح أخطاء المفاتيح المكررة في جدول محدد
 * Fix duplicate key errors in a specific table
 * 
 * @param tableName اسم الجدول المستهدف (اختياري)
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح الإصلاح
 */
export const clearDuplicateKeyErrors = async (tableName?: string | null): Promise<boolean> => {
  console.log(`[ErrorFixer] جاري محاولة إصلاح أخطاء المفاتيح المكررة في ${tableName || 'جميع الجداول'}`);
  
  try {
    // التركيز على جدول الإعدادات إذا لم يتم تحديد جدول
    // إذا كان هناك أخطاء متكررة في جدول الإعدادات
    if (!tableName || tableName === 'settings') {
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('*');
      
      if (fetchError) {
        console.error('[ErrorFixer] خطأ في جلب إعدادات الجدول:', fetchError);
        return false;
      }
      
      // فحص إذا كان هناك إعدادات متعددة، احتفظ فقط بالأحدث
      if (existingSettings && existingSettings.length > 1) {
        console.log(`[ErrorFixer] وجدت ${existingSettings.length} سجل إعدادات، سأحتفظ بواحد فقط`);
        
        // ترتيب البيانات حسب updated_at إذا كان موجوداً، أو استخدم ID
        let recordsToKeep: any[] = [];
        let recordsToDelete: any[] = [];
        
        // في حالة اسنخدام جدول الإعدادات، احتفظ فقط بسجل واحد
        if (tableName === 'settings' || !tableName) {
          recordsToKeep = [existingSettings[0]];
          recordsToDelete = existingSettings.slice(1);
        }
        
        // حذف السجلات الزائدة
        if (recordsToDelete.length > 0) {
          const idsToDelete = recordsToDelete.map(record => record.id);
          
          console.log(`[ErrorFixer] جاري حذف ${idsToDelete.length} سجل مكرر`);
          
          const { error: deleteError } = await supabase
            .from(tableName || 'settings')
            .delete()
            .in('id', idsToDelete);
          
          if (deleteError) {
            console.error('[ErrorFixer] خطأ في حذف السجلات المكررة:', deleteError);
            return false;
          }
          
          console.log('[ErrorFixer] تم حذف السجلات المكررة بنجاح');
          
          // عرض إشعار بنجاح الإصلاح
          toast({
            title: "تم إصلاح المشكلة",
            description: `تم حذف ${idsToDelete.length} سجل مكرر من جدول ${tableName || 'settings'}`,
            duration: 4000,
          });
          
          return true;
        }
      } else {
        console.log('[ErrorFixer] لم يتم العثور على سجلات مكررة في جدول الإعدادات');
      }
    }
    
    return false;
  } catch (error) {
    console.error('[ErrorFixer] خطأ أثناء محاولة إصلاح المفاتيح المكررة:', error);
    return false;
  }
};

/**
 * إعادة تهيئة اتصال Supabase
 * Reinitialize Supabase connection
 */
export const reinitializeSupabaseConnection = async (): Promise<boolean> => {
  console.log('[ErrorFixer] جاري إعادة تهيئة اتصال Supabase...');
  
  try {
    // محاولة تنفيذ استعلام بسيط للتحقق من حالة الاتصال
    const { data, error } = await supabase
      .from('settings')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('[ErrorFixer] فشل في إعادة تهيئة اتصال Supabase:', error);
      return false;
    }
    
    console.log('[ErrorFixer] تم إعادة تهيئة اتصال Supabase بنجاح');
    return true;
  } catch (error) {
    console.error('[ErrorFixer] خطأ أثناء إعادة تهيئة اتصال Supabase:', error);
    return false;
  }
};

/**
 * فحص وإصلاح مشاكل الاتصال بـ Supabase
 * Check and fix Supabase connection issues
 */
export const checkAndFixConnectionIssues = async (): Promise<boolean> => {
  console.log('[ErrorFixer] جاري فحص وإصلاح مشاكل الاتصال بـ Supabase...');
  
  try {
    // إعادة تهيئة الاتصال أولاً
    const isReinitialized = await reinitializeSupabaseConnection();
    
    if (!isReinitialized) {
      console.warn('[ErrorFixer] فشل في إعادة تهيئة الاتصال. جاري تجربة آلية أخرى...');
      
      // محاولة إصلاح أخطاء المفاتيح المكررة
      const isDuplicatesFixed = await clearDuplicateKeyErrors();
      
      if (isDuplicatesFixed) {
        console.log('[ErrorFixer] تم إصلاح أخطاء المفاتيح المكررة');
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[ErrorFixer] خطأ أثناء فحص وإصلاح مشاكل الاتصال:', error);
    return false;
  }
};
