
/**
 * طابور المزامنة - إدارة عمليات المزامنة المتعددة
 * Sync queue - Managing multiple sync operations
 */

import { toast } from '@/hooks/use-toast';
import { isSyncLocked, setSyncLock, releaseSyncLock, LOCK_TIMEOUT } from './lockState';

// طابور المزامنة
// Sync queue
const syncQueue: (() => Promise<boolean>)[] = [];
let isProcessingQueue = false; // متغير لتتبع ما إذا كانت معالجة الطابور قيد التنفيذ

// إضافة إلى طابور المزامنة مع تحسين إدارة الطابور
// Add to sync queue with improved queue management
export const addToSyncQueue = (syncFunction: () => Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    // إضافة متابعة طول الطابور
    // Add queue length monitoring
    const queueLength = syncQueue.length;
    console.log(`إضافة مهمة إلى طابور المزامنة (طول الطابور: ${queueLength})`);
    
    // حد أقصى لحجم الطابور لمنع تراكم المهام
    // Maximum queue size to prevent task accumulation
    if (queueLength > 5) {
      console.warn('طابور المزامنة طويل جدًا، تجاهل العملية الجديدة');
      resolve(false); // رفض العمليات الجديدة عندما يكون الطابور طويلاً جدًا
      return;
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
    
    // محاولة معالجة الطابور إذا لم يكن مقفلًا ولم تكن المعالجة قيد التنفيذ بالفعل
    // Try to process the queue if not locked and not already processing
    if (!isSyncLocked() && !isProcessingQueue) {
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
  
  if (isSyncLocked()) {
    console.log(`تأجيل معالجة طابور المزامنة: القفل نشط (${syncQueue.length} عناصر متبقية)`);
    return;
  }
  
  const nextSync = syncQueue.shift();
  if (!nextSync) return;
  
  const queueOwner = `queue-process-${Date.now()}`;
  
  // وضع علامة على أن المعالجة قيد التقدم
  // Mark that processing is in progress
  isProcessingQueue = true;
  
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
    
    // إعادة تعيين متغير الحالة
    // Reset state variable
    isProcessingQueue = false;
    
    // إذا كانت هناك عناصر إضافية في الطابور، استمر في المعالجة
    // If there are additional items in the queue, continue processing
    if (syncQueue.length > 0) {
      console.log(`استمرار معالجة الطابور (${syncQueue.length} عناصر متبقية)`);
      // تأخير قصير لمنع تنافس الموارد المحتملة
      // Short delay to prevent potential resource contention
      setTimeout(processNextQueueItem, 200);
    }
  }
};
