
/**
 * وظائف التحقق من صحة البيانات عند المزامنة
 * Data validation functions for synchronization
 */

/**
 * التحقق من صحة البيانات المستلمة من المصدر الخارجي
 * Validate data received from external source
 * 
 * @param data البيانات المراد التحقق منها
 * @returns ما إذا كانت البيانات صالحة
 */
export const validateRemoteData = (data: any): boolean => {
  // التحقق من أن البيانات موجودة وهي كائن
  // Check that data exists and is an object
  if (!data || typeof data !== 'object') {
    console.error('البيانات غير موجودة أو ليست كائن');
    return false;
  }
  
  // التحقق من وجود مصفوفة القنوات
  // Check for channels array
  if (!Array.isArray(data.channels)) {
    console.error('خاصية القنوات غير موجودة أو ليست مصفوفة');
    return false;
  }
  
  // التحقق من أن جميع القنوات تحتوي على الحقول المطلوبة
  // Check that all channels have required fields
  const requiredChannelFields = ['id', 'name', 'stream_url', 'logo'];
  
  const allChannelsValid = data.channels.every((channel: any) => {
    return requiredChannelFields.every(field => {
      if (channel[field] === undefined) {
        console.error(`القناة رقم ${channel.id || 'غير معروف'} تفتقد الحقل ${field}`);
        return false;
      }
      return true;
    });
  });
  
  if (!allChannelsValid) {
    console.error('بعض القنوات تفتقد حقولاً مطلوبة');
    return false;
  }
  
  // البيانات صالحة
  return true;
};
