
// آلية قفل المزامنة المحسنة
let syncLock = false;
let syncQueue: (() => Promise<boolean>)[] = [];
let lockTimeout: number | null = null;

// دالة لتحرير قفل المزامنة بشكل آمن
export const releaseSyncLock = () => {
  syncLock = false;
  lockTimeout = null;
  
  // تنفيذ العمليات المنتظرة في الطابور
  if (syncQueue.length > 0) {
    const nextSync = syncQueue.shift();
    if (nextSync) {
      setTimeout(() => {
        nextSync().catch(console.error);
      }, 500); // تأخير بسيط قبل تنفيذ العملية التالية
    }
  }
  
  // إلغاء مؤقت القفل إذا كان نشطًا
  if (lockTimeout) {
    clearTimeout(lockTimeout);
    lockTimeout = null;
  }
};

// Check if sync is currently in progress
export const isSyncLocked = (): boolean => {
  return syncLock;
};

// Set sync lock
export const setSyncLock = (): number => {
  syncLock = true;
  
  // إعداد مؤقت للحماية من القفل الدائم (15 ثانية كحد أقصى)
  lockTimeout = window.setTimeout(() => {
    console.warn('تجاوز الوقت المحدد للمزامنة، تحرير القفل بالقوة');
    releaseSyncLock();
  }, 15000);
  
  return lockTimeout;
};

// Add sync operation to queue
export const addToSyncQueue = (syncOperation: () => Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    syncQueue.push(async () => {
      const result = await syncOperation();
      resolve(result);
      return result;
    });
  });
};
