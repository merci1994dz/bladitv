
/**
 * طابور المزامنة - إدارة عمليات المزامنة المتعددة
 * Sync queue - Managing multiple sync operations
 */

import { toast } from '@/hooks/use-toast';
import { isSyncLocked, setSyncLock, releaseSyncLock, LOCK_TIMEOUT, tryAcquireLock } from './lockState';
import { checkActiveLocks } from './lockMonitor';

// طابور المزامنة
// Sync queue
const syncQueue: {
  id: string;
  fn: () => Promise<boolean>;
  priority: number;
  addedTime: number;
}[] = [];

let isProcessingQueue = false; // متغير لتتبع ما إذا كانت معالجة الطابور قيد التنفيذ
const MAX_QUEUE_SIZE = 8; // الحد الأقصى لحجم الطابور

// إضافة إلى طابور المزامنة مع تحسين إدارة الطابور
// Add to sync queue with improved queue management
export const addToSyncQueue = (
  syncFunction: () => Promise<boolean>, 
  options: { priority?: number } = {}
): Promise<boolean> => {
  return new Promise((resolve) => {
    // إضافة متابعة طول الطابور
    // Add queue length monitoring
    const queueLength = syncQueue.length;
    console.log(`إضافة مهمة إلى طابور المزامنة (طول الطابور: ${queueLength})`);
    
    // حد أقصى لحجم الطابور لمنع تراكم المهام
    // Maximum queue size to prevent task accumulation
    if (queueLength >= MAX_QUEUE_SIZE) {
      console.warn('طابور المزامنة ممتلئ، تجاهل العملية الجديدة');
      
      // إذا كانت المهمة الجديدة ذات أولوية عالية، قم بإزالة مهمة ذات أولوية منخفضة
      if (options.priority && options.priority > 1) {
        // ابحث عن أقل مهمة أولوية في الطابور
        const lowestPriorityIndex = syncQueue.reduce((lowest, current, index, arr) => {
          return arr[lowest].priority < current.priority ? lowest : index;
        }, 0);
        
        // إذا كانت المهمة الجديدة ذات أولوية أعلى، استبدل المهمة ذات الأولوية المنخفضة
        if (syncQueue[lowestPriorityIndex].priority < (options.priority || 0)) {
          console.log('استبدال مهمة ذات أولوية منخفضة بمهمة جديدة ذات أولوية عالية');
          syncQueue.splice(lowestPriorityIndex, 1);
        } else {
          resolve(false); // رفض العمليات الجديدة عندما يكون الطابور ممتلئا
          return;
        }
      } else {
        resolve(false); // رفض العمليات الجديدة عندما يكون الطابور ممتلئا
        return;
      }
    }
    
    // تنظيف الطابور من المهام القديمة
    const now = Date.now();
    const staleTasks = syncQueue.filter(task => now - task.addedTime > LOCK_TIMEOUT * 2);
    
    if (staleTasks.length > 0) {
      console.warn(`إزالة ${staleTasks.length} مهام قديمة من الطابور`);
      syncQueue.forEach((task, index) => {
        if (now - task.addedTime > LOCK_TIMEOUT * 2) {
          syncQueue.splice(index, 1);
        }
      });
    }
    
    // إنشاء معرف فريد للمهمة
    const taskId = `queue-task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // إضافة مهمة جديدة إلى الطابور مع الأولوية
    syncQueue.push({
      id: taskId,
      fn: async () => {
        console.log(`بدء تنفيذ مهمة الطابور: ${taskId}`);
        try {
          // تنفيذ وظيفة المزامنة مع مهلة زمنية
          const timeoutPromise = new Promise<boolean>((timeoutResolve) => {
            setTimeout(() => {
              console.warn(`تجاوز الوقت المحدد لمهمة الطابور: ${taskId}`);
              timeoutResolve(false);
            }, LOCK_TIMEOUT - 1000);
          });
          
          const result = await Promise.race([syncFunction(), timeoutPromise]);
          console.log(`اكتملت مهمة الطابور: ${taskId}, النتيجة: ${result}`);
          resolve(result);
          return result;
        } catch (error) {
          console.error(`خطأ في تنفيذ مهمة الطابور (${taskId}):`, error);
          resolve(false);
          return false;
        }
      },
      priority: options.priority || 0,
      addedTime: Date.now()
    });
    
    // ترتيب الطابور حسب الأولوية (الأعلى أولاً)
    syncQueue.sort((a, b) => b.priority - a.priority);
    
    // محاولة معالجة الطابور إذا لم يكن مقفلًا ولم تكن المعالجة قيد التنفيذ بالفعل
    if (!checkActiveLocks() && !isProcessingQueue) {
      processNextQueueItem();
    }
  });
};

// معالجة العنصر التالي في الطابور مع تعزيز معالجة الأخطاء
// Process next item in queue with enhanced error handling
export const processNextQueueItem = async (): Promise<void> => {
  // تجنب تكرار معالجة الطابور
  // Avoid duplicate queue processing
  if (isProcessingQueue) {
    console.log(`تأجيل معالجة طابور المزامنة: المعالجة قيد التقدم بالفعل`);
    return;
  }
  
  if (syncQueue.length === 0) {
    return;
  }
  
  // التحقق من وجود أقفال نشطة
  if (checkActiveLocks()) {
    console.log(`تأجيل معالجة طابور المزامنة: يوجد قفل نشط (${syncQueue.length} عناصر متبقية)`);
    return;
  }
  
  // وضع علامة على أن المعالجة قيد التقدم
  isProcessingQueue = true;
  
  // الحصول على المهمة التالية من الطابور
  const nextTask = syncQueue.shift();
  if (!nextTask) {
    isProcessingQueue = false;
    return;
  }
  
  // محاولة اكتساب القفل مع انتظار قصير
  const lockAcquired = await tryAcquireLock(`queue-process-${nextTask.id}`, 3000);
  
  if (!lockAcquired) {
    console.warn(`فشل في اكتساب القفل لمعالجة مهمة الطابور: ${nextTask.id}`);
    
    // إعادة المهمة إلى الطابور إذا لم تكن قديمة جدًا
    if (Date.now() - nextTask.addedTime < LOCK_TIMEOUT) {
      console.log(`إعادة إضافة المهمة ${nextTask.id} إلى الطابور للمحاولة لاحقًا`);
      syncQueue.unshift(nextTask);
    } else {
      console.warn(`تجاهل المهمة ${nextTask.id} لأنها قديمة جدًا`);
    }
    
    isProcessingQueue = false;
    return;
  }
  
  try {
    // تنفيذ المهمة
    await nextTask.fn();
  } catch (error) {
    console.error(`خطأ أثناء معالجة مهمة الطابور (${nextTask.id}):`, error);
    
    // عرض إشعار للمستخدم
    try {
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء تحديث البيانات. سيتم إعادة المحاولة لاحقًا.",
        variant: "destructive",
      });
    } catch (e) {
      // تجاهل أي خطأ في عرض الإشعار
      console.warn('فشل في عرض إشعار خطأ المزامنة:', e);
    }
  } finally {
    // التأكد من تحرير القفل دائمًا
    releaseSyncLock(`queue-process-${nextTask.id}`);
    
    // إعادة تعيين متغير الحالة
    isProcessingQueue = false;
    
    // إذا كانت هناك عناصر إضافية في الطابور، استمر في المعالجة
    if (syncQueue.length > 0) {
      console.log(`استمرار معالجة الطابور (${syncQueue.length} عناصر متبقية)`);
      // تأخير قصير لمنع تنافس الموارد المحتملة
      setTimeout(processNextQueueItem, 300);
    }
  }
};

// الحصول على حالة الطابور الحالية
// Get current queue state
export const getQueueState = () => {
  return {
    length: syncQueue.length,
    isProcessing: isProcessingQueue,
    tasks: syncQueue.map(task => ({
      id: task.id,
      priority: task.priority,
      age: Date.now() - task.addedTime
    }))
  };
};

// تنظيف الطابور من المهام القديمة
// Clean queue from stale tasks
export const cleanupStaleQueueItems = () => {
  const now = Date.now();
  const initialLength = syncQueue.length;
  
  // إزالة المهام القديمة
  for (let i = syncQueue.length - 1; i >= 0; i--) {
    if (now - syncQueue[i].addedTime > LOCK_TIMEOUT * 2) {
      syncQueue.splice(i, 1);
    }
  }
  
  const removedCount = initialLength - syncQueue.length;
  if (removedCount > 0) {
    console.log(`تم تنظيف ${removedCount} مهام قديمة من طابور المزامنة`);
  }
  
  return removedCount;
};
