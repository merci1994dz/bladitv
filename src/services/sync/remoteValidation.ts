
/**
 * Validate remote data structure
 */
export const validateRemoteData = (data: any): boolean => {
  if (!data) return false;
  
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
  
  // Validate that each channel has required fields
  for (const channel of data.channels) {
    if (!channel.name || !channel.streamUrl) {
      console.error('قناة غير صالحة:', channel);
      return false;
    }
  }
  
  return true;
};
