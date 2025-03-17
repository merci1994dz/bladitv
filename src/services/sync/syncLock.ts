
// آلية قفل المزامنة المحسنة لمنع المزامنات المتزامنة
import { toast } from '@/hooks/use-toast';

// حالة القفل
let syncLocked = false;
let syncLockTimestamp = 0;
let syncLockOwner = ''; // معرف للعملية التي تملك القفل

// تقليل مهلة القفل لتحسين التعافي من الفشل
const LOCK_TIMEOUT = 25000; // 25 ثانية
const syncQueue: (() => Promise<boolean>)[] = [];

// التحقق مما إذا كانت المزامنة مقفلة
export const isSyncLocked = (): boolean => {
  // التحقق من انتهاء مهلة القفل
  if (syncLocked && Date.now() - syncLockTimestamp > LOCK_TIMEOUT) {
    console.warn(`تجاوز الوقت المحدد للمزامنة (${LOCK_TIMEOUT}ms)، تحرير القفل بالقوة`);
    releaseSyncLock();
    return false;
  }
  return syncLocked;
};

// وضع قفل المزامنة مع تعزيز أمان القفل
export const setSyncLock = (owner = ''): boolean => {
  if (syncLocked) {
    return false;
  }
  
  syncLocked = true;
  syncLockTimestamp = Date.now();
  syncLockOwner = owner || `process-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // تسجيل حالة القفل
  console.log(`تم وضع قفل المزامنة: ${syncLockOwner}`);
  
  // تخزين معلومات القفل لفحص تعارضات القفل المحتملة
  try {
    const lockInfo = {
      owner: syncLockOwner,
      timestamp: syncLockTimestamp,
      timeout: LOCK_TIMEOUT
    };
    sessionStorage.setItem('sync_lock_info', JSON.stringify(lockInfo));
  } catch (e) {
    // تجاهل أخطاء التخزين
  }
  
  return true;
};

// تحرير قفل المزامنة
export const releaseSyncLock = (owner = ''): boolean => {
  // التحقق من المالك للأمان (إذا تم تحديده)
  if (owner && syncLockOwner && owner !== syncLockOwner) {
    console.warn(`محاولة تحرير قفل مملوك لعملية أخرى (${syncLockOwner} != ${owner})، تجاهل`);
    return false;
  }
  
  console.log(`تحرير قفل المزامنة${owner ? ` (${owner})` : ''}`);
  
  syncLocked = false;
  syncLockTimestamp = 0;
  syncLockOwner = '';
  
  // مسح معلومات القفل المخزنة
  try {
    sessionStorage.removeItem('sync_lock_info');
  } catch (e) {
    // تجاهل أخطاء التخزين
  }
  
  // معالجة العنصر التالي في الطابور
  processNextQueueItem();
  return true;
};

// إضافة إلى طابور المزامنة مع تحسين إدارة الطابور
export const addToSyncQueue = (syncFunction: () => Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    // إضافة متابعة طول الطابور
    const queueLength = syncQueue.length;
    console.log(`إضافة مهمة إلى طابور المزامنة (طول الطابور: ${queueLength})`);
    
    // التحقق مما إذا كان الطابور أصبح طويلاً جدًا
    if (queueLength > 5) {
      console.warn('طابور المزامنة طويل جدًا، قد يكون هناك مشكلة');
      
      // إذا كان الطابور طويلاً جدًا والمزامنة مقفلة، قد يكون هناك مشكلة في القفل
      if (syncLocked && Date.now() - syncLockTimestamp > LOCK_TIMEOUT / 2) {
        console.warn('تسريع تحرير القفل بسبب طول الطابور');
        releaseSyncLock();
      }
    }
    
    // إضافة دالة مغلفة تحل الوعد بتحسين معالجة الأخطاء
    syncQueue.push(async () => {
      const queueItemId = `queue-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`بدء معالجة عنصر الطابور: ${queueItemId}`);
      
      try {
        // تنفيذ وظيفة المزامنة مع مهلة زمنية
        const timeoutPromise = new Promise<boolean>((timeoutResolve) => {
          setTimeout(() => {
            console.warn(`تجاوز الوقت المحدد لعنصر الطابور: ${queueItemId}`);
            timeoutResolve(false);
          }, LOCK_TIMEOUT - 1000);
        });
        
        // استخدام Promise.race لتجنب التعليق
        const result = await Promise.race([syncFunction(), timeoutPromise]);
        
        console.log(`اكتمل عنصر الطابور: ${queueItemId}, النتيجة: ${result}`);
        resolve(result);
        return result;
      } catch (error) {
        console.error(`خطأ في معالجة طابور المزامنة (${queueItemId}):`, error);
        resolve(false);
        return false;
      } finally {
        console.log(`انتهى عنصر الطابور: ${queueItemId}`);
      }
    });
    
    // محاولة معالجة الطابور إذا لم يكن مقفلًا
    if (!isSyncLocked()) {
      processNextQueueItem();
    }
  });
};

// معالجة العنصر التالي في الطابور مع تعزيز معالجة الأخطاء
const processNextQueueItem = async (): Promise<void> => {
  if (syncQueue.length === 0) {
    return;
  }
  
  if (isSyncLocked()) {
    console.log(`تأجيل معالجة طابور المزامنة: القفل نشط (${syncQueue.length} عناصر متبقية)`);
    return;
  }
  
  const nextSync = syncQueue.shift();
  if (!nextSync) return;
  
  const queueOwner = `queue-process-${Date.now()}`;
  
  // وضع القفل وتنفيذ وظيفة المزامنة
  setSyncLock(queueOwner);
  
  try {
    // تنفيذ العملية
    await nextSync();
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
    releaseSyncLock(queueOwner);
    
    // إذا كانت هناك عناصر إضافية في الطابور، استمر في المعالجة
    if (syncQueue.length > 0) {
      console.log(`استمرار معالجة الطابور (${syncQueue.length} عناصر متبقية)`);
      // تأخير قصير لمنع تنافس الموارد المحتملة
      setTimeout(processNextQueueItem, 100);
    }
  }
};

// التحقق الدوري من انتهاء مهلة القفل بشكل أكثر تكرارًا وفعالية
if (typeof window !== 'undefined') {
  // التحقق من القفل كل 10 ثواني
  setInterval(() => {
    if (syncLocked) {
      const lockDuration = Date.now() - syncLockTimestamp;
      
      // التحقق بشكل متدرج
      if (lockDuration > LOCK_TIMEOUT) {
        console.warn(`تم اكتشاف قفل معلق (${lockDuration}ms > ${LOCK_TIMEOUT}ms)، تحرير القفل تلقائيًا`);
        releaseSyncLock();
      } else if (lockDuration > LOCK_TIMEOUT * 0.7) {
        // تحذير مبكر
        console.warn(`قفل المزامنة مستمر لفترة طويلة (${lockDuration}ms)، قد يكون معلقًا`);
      }
    }
    
    // فحص طول الطابور للكشف عن المشكلات المحتملة
    if (syncQueue.length > 3) {
      console.warn(`اكتشاف طابور مزامنة طويل: ${syncQueue.length} عناصر`);
    }
  }, 10000);
  
  // كشف تحديثات الصفحة وإعادة تحميلها لإعادة تعيين حالة القفل
  window.addEventListener('beforeunload', () => {
    if (syncLocked) {
      console.log('إعادة تعيين قفل المزامنة قبل تحديث الصفحة');
      releaseSyncLock();
    }
  });
  
  // استعادة حالة القفل من sessionStorage في حالة إعادة تحميل الصفحة
  try {
    const lockInfoStr = sessionStorage.getItem('sync_lock_info');
    if (lockInfoStr) {
      const lockInfo = JSON.parse(lockInfoStr);
      const elapsed = Date.now() - lockInfo.timestamp;
      
      // إذا لم تنتهِ صلاحية القفل بعد، استعادته
      if (elapsed < lockInfo.timeout) {
        console.log(`استعادة قفل المزامنة من الجلسة: ${lockInfo.owner} (${elapsed}ms مضت)`);
        syncLocked = true;
        syncLockTimestamp = lockInfo.timestamp;
        syncLockOwner = lockInfo.owner;
      } else {
        // إذا انتهت صلاحية القفل، مسحه
        console.log('تم العثور على قفل منتهي الصلاحية، مسحه');
        sessionStorage.removeItem('sync_lock_info');
      }
    }
  } catch (e) {
    // تجاهل أخطاء التخزين
    console.error('خطأ في استعادة معلومات القفل:', e);
  }
}
