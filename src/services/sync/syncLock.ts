
// آلية قفل المزامنة لمنع المزامنات المتزامنة
import { toast } from '@/hooks/use-toast';

// حالة القفل
let syncLocked = false;
let syncLockTimestamp = 0;
const LOCK_TIMEOUT = 30000; // تقليل المهلة إلى 30 ثانية
const syncQueue: (() => Promise<boolean>)[] = [];

// التحقق مما إذا كانت المزامنة مقفلة
export const isSyncLocked = (): boolean => {
  // التحقق من انتهاء مهلة القفل
  if (syncLocked && Date.now() - syncLockTimestamp > LOCK_TIMEOUT) {
    console.warn('تجاوز الوقت المحدد للمزامنة، تحرير القفل بالقوة');
    releaseSyncLock();
    return false;
  }
  return syncLocked;
};

// وضع قفل المزامنة
export const setSyncLock = (): boolean => {
  if (syncLocked) {
    return false;
  }
  syncLocked = true;
  syncLockTimestamp = Date.now();
  return true;
};

// تحرير قفل المزامنة
export const releaseSyncLock = (): void => {
  syncLocked = false;
  syncLockTimestamp = 0;
  processNextQueueItem();
};

// إضافة إلى طابور المزامنة
export const addToSyncQueue = (syncFunction: () => Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    // إضافة دالة مغلفة تحل الوعد
    syncQueue.push(async () => {
      try {
        const result = await syncFunction();
        resolve(result);
        return result;
      } catch (error) {
        console.error('خطأ في معالجة طابور المزامنة:', error);
        resolve(false);
        return false;
      }
    });
    
    // محاولة معالجة الطابور إذا لم يكن مقفلًا
    if (!isSyncLocked()) {
      processNextQueueItem();
    }
  });
};

// معالجة العنصر التالي في الطابور
const processNextQueueItem = async (): Promise<void> => {
  if (syncQueue.length === 0 || isSyncLocked()) {
    return;
  }
  
  const nextSync = syncQueue.shift();
  if (!nextSync) return;
  
  // وضع القفل وتنفيذ وظيفة المزامنة
  setSyncLock();
  
  try {
    // إضافة مهلة زمنية داخلية للتأكد من عدم تعليق المزامنة إلى ما لا نهاية
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn('تجاوز الوقت المحدد لمعالجة طابور المزامنة، إلغاء العملية');
        resolve(false);
      }, LOCK_TIMEOUT - 1000); // استخدام مهلة أقل بقليل من مهلة القفل
    });
    
    // استخدام Promise.race لتجنب التعليق
    await Promise.race([nextSync(), timeoutPromise]);
  } catch (error) {
    console.error('خطأ أثناء معالجة طابور المزامنة:', error);
    
    // عرض إشعار للمستخدم
    try {
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء تحديث البيانات. سيتم إعادة المحاولة لاحقًا.",
        variant: "destructive",
      });
    } catch (e) {
      // تجاهل أي خطأ في عرض الإشعار
    }
  } finally {
    // التأكد من تحرير القفل دائمًا
    releaseSyncLock();
  }
};

// التحقق الدوري من انتهاء مهلة القفل بشكل أكثر تكرارًا
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (syncLocked && Date.now() - syncLockTimestamp > LOCK_TIMEOUT) {
      console.warn('تم اكتشاف قفل معلق، تحرير القفل تلقائيًا');
      releaseSyncLock();
    }
  }, 15000); // التحقق كل 15 ثانية
}
