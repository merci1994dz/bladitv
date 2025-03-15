
import { isSyncing } from '../dataStore';
import { isSyncLocked } from './syncLock';

// دالة للتحقق من حالة المزامنة
export const isSyncInProgress = (): boolean => {
  return isSyncing || isSyncLocked();
};
