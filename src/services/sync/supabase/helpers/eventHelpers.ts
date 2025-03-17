
/**
 * مساعدات للتعامل مع أحداث تحديث البيانات
 * Helpers for handling data update events
 */

/**
 * إطلاق حدث تحديث البيانات
 * Trigger data updated event
 */
export const triggerDataUpdatedEvent = (source: string): void => {
  try {
    const event = new CustomEvent('data_updated', {
      detail: { source, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  } catch (eventError) {
    console.error('خطأ في إطلاق حدث التحديث / Error triggering update event:', eventError);
  }
};
