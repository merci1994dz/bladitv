
/**
 * أدوات مساعدة لإعداد سمات مشغل الفيديو
 */

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
