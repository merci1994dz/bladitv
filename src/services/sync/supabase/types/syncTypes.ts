
/**
 * أنواع البيانات المستخدمة في عمليات مزامنة Supabase
 * Types used in Supabase sync operations
 */

export interface SyncResult {
  success: boolean;
  source: string;
  timestamp: number;
  error?: any;
}

export interface DataUpdateEvent {
  source: string;
  timestamp: number;
}
