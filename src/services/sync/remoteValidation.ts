
/**
 * Validate remote data structure
 */
export const validateRemoteData = (data: any): boolean => {
  if (!data) {
    console.error('البيانات المستلمة فارغة أو غير محددة');
    return false;
  }
  
  // التحقق من وجود المصفوفات المطلوبة
  if (!Array.isArray(data.channels)) {
    console.error('بيانات القنوات غير صالحة - يجب أن تكون مصفوفة');
    return false;
  }
  
  if (!Array.isArray(data.countries)) {
    console.error('بيانات الدول غير صالحة - يجب أن تكون مصفوفة');
    return false;
  }
  
  if (!Array.isArray(data.categories)) {
    console.error('بيانات الفئات غير صالحة - يجب أن تكون مصفوفة');
    return false;
  }
  
  // الحد الأدنى من طول المصفوفات
  if (data.channels.length === 0) {
    console.warn('مصفوفة القنوات فارغة');
  }
  
  if (data.countries.length === 0) {
    console.warn('مصفوفة الدول فارغة');
  }
  
  if (data.categories.length === 0) {
    console.warn('مصفوفة الفئات فارغة');
  }
  
  // التحقق من أن كل قناة تحتوي على الحقول المطلوبة
  for (const channel of data.channels) {
    if (!channel.id) {
      console.error('قناة بدون معرف:', channel);
      return false;
    }
    
    if (!channel.name || typeof channel.name !== 'string') {
      console.error('قناة بدون اسم صالح:', channel);
      return false;
    }
    
    if (!channel.streamUrl || typeof channel.streamUrl !== 'string') {
      console.error('قناة بدون رابط بث صالح:', channel);
      return false;
    }
    
    // التحقق من أن category هو سلسلة نصية إذا كان موجودًا
    if (channel.category !== undefined && channel.category !== null && typeof channel.category !== 'string') {
      console.error('قناة مع فئة غير صالحة (يجب أن تكون سلسلة نصية):', channel);
      return false;
    }
  }
  
  return true;
};
