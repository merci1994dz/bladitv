// هذا الملف يعمل كنقطة تصدير رئيسية لجميع خدمات API

// إعادة تصدير كل شيء من وحدات الخدمة
export * from './channelService';
export * from './categoryService';
export * from './countryService';
export * from './adminService';
export * from './sync';  // تم التحديث لاستخدام وحدة المزامنة الجديدة

export const getRecentlyWatchedChannels = async () => {
  try {
    // في بيئة الإنتاج، هذه الدالة ستتصل بالواجهة الخلفية
    // لكن هنا سنستخدم محاكاة للبيانات المخزنة محلياً
    
    // الحصول على القنوات المشاهدة مؤخراً من التخزين المحلي
    const recentlyWatchedJson = localStorage.getItem('recently_watched_channels');
    
    if (recentlyWatchedJson) {
      const recentlyWatched = JSON.parse(recentlyWatchedJson);
      
      // الحصول على كل القنوات
      const allChannels = await getChannels();
      
      // تصفية القنوات حسب القائمة المشاهدة مؤخرا
      const recentChannels = allChannels
        .filter(channel => recentlyWatched.includes(channel.id))
        .map(channel => ({
          ...channel,
          // إضافة وقت المشاهدة الأخير (يمكن أن يكون محفوظًا مع المعرف في حالة تطبيق حقيقي)
          lastWatched: new Date().toISOString()
        }))
        .slice(0, 10); // عرض أحدث 10 قنوات فقط
      
      return recentChannels;
    }
    
    // إذا لم تكن هناك قنوات مشاهدة مؤخراً، نعيد مصفوفة فارغة
    return [];
  } catch (error) {
    console.error('Error fetching recently watched channels:', error);
    return [];
  }
};
