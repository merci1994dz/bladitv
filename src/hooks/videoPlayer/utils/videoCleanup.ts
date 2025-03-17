
/**
 * أدوات مساعدة لتنظيف مشغل الفيديو
 */
import { VideoRef } from '../useVideoSetup';

/**
 * تنظيف مشغل الفيديو وإعادة تعيينه
 * @param videoRef مرجع عنصر الفيديو
 * @returns نجاح العملية
 */
export const cleanupVideoPlayer = (videoRef: VideoRef): boolean => {
  if (!videoRef.current) return false;
  
  try {
    // إيقاف التشغيل أولاً
    videoRef.current.pause();
    
    // إزالة المستمعين للتخلص من أي حدث معلق
    videoRef.current.oncanplay = null;
    videoRef.current.onplaying = null;
    videoRef.current.onerror = null;
    videoRef.current.onloadeddata = null;
    videoRef.current.onprogress = null;
    
    // تنظيف المصدر
    videoRef.current.removeAttribute('src');
    videoRef.current.load();
    
    return true;
  } catch (e) {
    console.error("خطأ في تنظيف مشغل الفيديو:", e);
    return false;
  }
};
