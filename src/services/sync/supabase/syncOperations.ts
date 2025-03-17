
/**
 * ملف إعادة تصدير لعمليات مزامنة Supabase
 * Re-export file for Supabase sync operations
 * 
 * @deprecated استخدم الوظائف المستوردة من './operations/dataSync' بدلاً من ذلك
 * Use functions imported from './operations/dataSync' instead
 */

import { syncWithSupabase } from './operations/dataSync';

// تصدير للحفاظ على التوافق مع الإصدارات السابقة
// Export for backward compatibility
export { syncWithSupabase };
