
/**
 * ملف واجهة لمزامنة Supabase
 * تم إعادة هيكلة هذا الملف إلى مكونات أصغر
 * 
 * @deprecated استخدم الواردات المباشرة من `src/services/sync/supabase` بدلاً من ذلك
 */

export { 
  syncWithSupabase, 
  initializeSupabaseTables, 
  setupRealtimeSync 
} from './supabase';

// إضافة تحذير عند استيراد هذا الملف
console.warn(
  'تحذير: الاستيراد من supabaseSync.ts قديم. ' +
  'يرجى تحديث الاستيرادات لاستخدام المكونات من src/services/sync/supabase/* بدلاً من ذلك.'
);
