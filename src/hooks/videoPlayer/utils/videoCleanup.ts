
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

/**
 * إعداد سمات الفيديو المناسبة للتشغيل
 * @param videoElement عنصر الفيديو
 * @param options خيارات إضافية
 */
export const setupVideoAttributes = (
  videoElement: HTMLVideoElement, 
  options: { muted?: boolean, attemptNumber?: number } = {}
): void => {
  const { muted = false, attemptNumber = 0 } = options;
  
  // تعيين خصائص مختلفة للفيديو للمساعدة في التشغيل
  videoElement.autoplay = true;
  videoElement.muted = muted || (attemptNumber === 2); // تجربة كتم الصوت في المحاولة الثالثة
  videoElement.playsInline = true;
  videoElement.crossOrigin = "anonymous";
  
  // إضافة سمات لتحسين التوافق
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('webkit-playsinline', '');
};
