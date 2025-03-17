
/**
 * طابور المزامنة - إدارة عمليات المزامنة المتعددة
 * Sync queue - Managing multiple sync operations
 */

import { toast } from '@/hooks/use-toast';
import { isSyncLocked, setSyncLock, releaseSyncLock, LOCK_TIMEOUT } from './lockState';

// طابور المزامنة
// Sync queue
const syncQueue: (() => Promise<boolean>)[] = [];

// إضافة إلى طابور المزامنة مع تحسين إدارة الطابور
// Add to sync queue with improved queue management
export const addToSyncQueue = (syncFunction: () => Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    // إضافة متابعة طول الطابور
    // Add queue length monitoring
    const queueLength = syncQueue.length;
    console.log(`إضافة مهمة إلى طابور المزامنة (طول الطابور: ${queueLength})`);
    
    // التحقق مما إذا كان الطابور أصبح طويلاً جدًا
    // Check if queue has become too long
    if (queueLength > 5) {
      console.warn('طابور المزامنة طويل جدًا، قد يكون هناك مشكلة');
      
      // إذا كان الطابور طويلاً جدًا والمزامنة مقفلة، قد يكون هناك مشكلة في القفل
      // If queue is too long and sync is locked, there may be a lock problem
      if (isSyncLocked() && Date.now() - LOCK_TIMEOUT / 2) {
        console.warn('تسريع تحرير القفل بسبب طول الطابور');
        releaseSyncLock();
      }
    }
    
    // إضافة دالة مغلفة تحل الوعد بتحسين معالجة الأخطاء
    // Add wrapped function that resolves the promise with improved error handling
    syncQueue.push(async () => {
      const queueItemId = `queue-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`بدء معالجة عنصر الطابور: ${queueItemId}`);
      
      try {
        // تنفيذ وظيفة المزامنة مع مهلة زمنية
        // Execute sync function with timeout
        const timeoutPromise = new Promise<boolean>((timeoutResolve) => {
          setTimeout(() => {
            console.warn(`تجاوز الوقت المحدد لعنصر الطابور: ${queueItemId}`);
            timeoutResolve(false);
          }, LOCK_TIMEOUT - 1000);
        });
        
        // استخدام Promise.race لتجنب التعليق
        // Use Promise.race to avoid hanging
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
    // Try to process the queue if not locked
    if (!isSyncLocked()) {
      processNextQueueItem();
    }
  });
};

// معالجة العنصر التالي في الطابور مع تعزيز معالجة الأخطاء
// Process next item in queue with enhanced error handling
export const processNextQueueItem = async (): Promise<void> => {
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
  // Set lock and execute sync function
  setSyncLock(queueOwner);
  
  try {
    // تنفيذ العملية
    // Execute operation
    await nextSync();
  } catch (error) {
    console.error('خطأ أثناء معالجة طابور المزامنة:', error);
    
    // عرض إشعار للمستخدم
    // Show notification to user
    try {
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء تحديث البيانات. سيتم إعادة المحاولة لاحقًا.",
        variant: "destructive",
      });
    } catch (e) {
      // تجاهل أي خطأ في عرض الإشعار
      // Ignore any error in displaying the notification
    }
  } finally {
    // التأكد من تحرير القفل دائمًا
    // Always make sure to release the lock
    releaseSyncLock(queueOwner);
    
    // إذا كانت هناك عناصر إضافية في الطابور، استمر في المعالجة
    // If there are additional items in the queue, continue processing
    if (syncQueue.length > 0) {
      console.log(`استمرار معالجة الطابور (${syncQueue.length} عناصر متبقية)`);
      // تأخير قصير لمنع تنافس الموارد المحتملة
      // Short delay to prevent potential resource contention
      setTimeout(processNextQueueItem, 100);
    }
  }
};
