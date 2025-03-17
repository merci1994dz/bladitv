
/**
 * ملف واجهة لوظائف المزامنة الأساسية
 * تم إعادة هيكلة هذا الملف إلى مكونات أصغر
 * 
 * @deprecated استخدم الواردات المباشرة من `src/services/sync/core` بدلاً من ذلك
 */

export { 
  syncAllData, 
  performInitialSync 
} from './core/syncOperations';

// إضافة تحذير عند استيراد هذا الملف
console.warn(
  'تحذير: الاستيراد من coreSync.ts قديم. ' +
  'يرجى تحديث الاستيرادات لاستخدام المكونات من src/services/sync/core/* بدلاً من ذلك.'
);
