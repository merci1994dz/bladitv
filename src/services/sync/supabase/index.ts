
/**
 * مؤشر التصدير الرئيسي لوظائف مزامنة Supabase
 * Main export index for Supabase sync functions
 */

// تصدير العمليات الأساسية
// Export core operations
export { syncWithSupabase } from './operations/dataSync';
export { initializeSupabaseTables } from './initialize';
export { setupRealtimeSync } from './realtime';

// تصدير الأنواع والمساعدات
// Export types and helpers
export { triggerDataUpdatedEvent } from './helpers/eventHelpers';
export type { SyncResult, DataUpdateEvent } from './types/syncTypes';
