
/**
 * إعداد خصائص الفيديو المشتركة
 */
interface VideoAttributes {
  attemptNumber?: number;
  autoplay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: "" | "none" | "metadata" | "auto";
}

/**
 * وظيفة لإعداد خصائص عنصر الفيديو
 */
export function setupVideoAttributes(
  videoElement: HTMLVideoElement,
  options: VideoAttributes = {}
): void {
  // تعيين السمات الافتراضية
  videoElement.preload = options.preload || "auto";
  videoElement.autoplay = options.autoplay !== undefined ? options.autoplay : true;
  videoElement.muted = options.muted !== undefined ? options.muted : true;
  videoElement.playsInline = options.playsInline !== undefined ? options.playsInline : true;
  
  // إضافة سمات خاصة بملاحظات محاولة إعادة التشغيل
  if (options.attemptNumber !== undefined) {
    videoElement.dataset.attemptNumber = options.attemptNumber.toString();
  }
  
  // إضافة السمات الضرورية لدعم التوافق مع مختلف المتصفحات
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.setAttribute('playsinline', 'true');
  
  // تنظيف أي معاملات إضافية
  videoElement.removeAttribute('controls');
  
  // تطبيق خصائص متقدمة للأداء
  try {
    // @ts-ignore - خصائص متقدمة قد لا تكون مدعومة في جميع المتصفحات
    if (videoElement.hasOwnProperty('disableRemotePlayback')) {
      // @ts-ignore
      videoElement.disableRemotePlayback = true;
    }
  } catch (e) {
    console.warn('خصائص الفيديو المتقدمة غير مدعومة في هذا المتصفح:', e);
  }
}
