
/**
 * أنواع البيانات لنظام قفل المزامنة
 * Types for the sync lock system
 */

export interface LockInfo {
  owner: string;
  timestamp: number;
  timeout: number;
}

export interface LockState {
  isLocked: boolean;
  timestamp: number;
  owner: string;
}

export interface QueueItem {
  id: string;
  function: () => Promise<boolean>;
  addedAt: number;
}
