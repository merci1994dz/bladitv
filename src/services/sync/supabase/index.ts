
/**
 * مؤشر التصدير الرئيسي لوظائف مزامنة Supabase
 * Main export index for Supabase sync functions
 */

// تصدير عمليات المزامنة الأساسية
// Export core sync operations
export { performSupabaseSync } from './sync/syncCore';
export { initializeSupabaseTables } from './initialize';
export { setupSupabaseRealtimeSync as setupRealtimeSync } from './realtime/realtimeSync';

// تصدير وظائف التحقق من الاتصال
// Export connection checking functions
export { checkSupabaseConnection, getSupabaseTableStats } from './connection/connectionCheck';

// تصدير وظائف معالجة الأخطاء
// Export error handling functions
export { 
  handleSupabaseError, 
  classifySupabaseError, 
  SupabaseSyncErrorType 
} from './syncErrorHandler';

// تصدير الأنواع والمساعدات
// Export types and helpers
export { triggerDataUpdatedEvent } from './helpers/eventHelpers';
export type { SyncResult, DataUpdateEvent } from './types/syncTypes';
