
import { useState, useRef, useEffect } from 'react';
import { VIDEO_PLAYER, SECURITY_CONFIG } from '@/services/config';

// تعريف نوع VideoRef للاستخدام في الملفات الأخرى
export type VideoRef = React.RefObject<HTMLVideoElement>;

/**
 * إعداد مصدر الفيديو مع إجراءات أمنية
 * @param videoElement عنصر الفيديو المراد إعداده
 * @param streamUrl عنوان URL للبث
 * @returns قيمة منطقية تشير إلى نجاح الإعداد
 */
export const setupVideoSource = (videoElement: HTMLVideoElement, streamUrl: string): boolean => {
  if (!streamUrl) {
    console.error('عنوان URL للبث فارغ');
    return false;
  }

  try {
    // إعادة تعيين حالة عنصر الفيديو
    videoElement.pause();
    videoElement.currentTime = 0;
    videoElement.src = '';
    videoElement.load();
    
    // إعداد بسيط للمصدر - بدون تشفير للتوافق مع الأجهزة المحمولة
    videoElement.src = streamUrl;
    
    // إعدادات أساسية متوافقة مع الأجهزة المحمولة
    videoElement.playsInline = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.setAttribute('x5-playsinline', '');
    videoElement.muted = false;
    videoElement.volume = 1.0;
    videoElement.autoplay = false;
    videoElement.preload = 'auto';
    
    // تعيين سمات عناصر التحكم المتوافقة مع الأجهزة المحمولة
    if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
      videoElement.controlsList?.add('nodownload');
    }
    
    videoElement.setAttribute('oncontextmenu', 'return false;');
    
    // نمط متوافق مع الأجهزة المحمولة
    videoElement.style.objectFit = 'contain';
    
    return true;
  } catch (error) {
    console.error('خطأ في إعداد مصدر الفيديو:', error);
    return false;
  }
};

// دالة مساعدة محسنة للكشف عما إذا كان الجهاز الحالي محمولًا
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (typeof window !== 'undefined' && window.innerWidth < 768) ||
         (typeof window !== 'undefined' && 'ontouchstart' in window);
}

/**
 * Hook لإعداد حالة مشغل الفيديو والمراجع
 */
export function useVideoSetup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // الكشف عن الجهاز المحمول عند التركيب
  useEffect(() => {
    const mobile = isMobileDevice();
    setIsMobile(mobile);
    console.log("الجهاز المحمول:", mobile);
    
    // تعيين سمة meta للتوافق مع الأجهزة المحمولة
    if (mobile && document.head) {
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
    
    // عودة دالة التنظيف
    return () => {
      // تنظيف سمة meta عند إلغاء التثبيت إذا قمنا بإنشائها
      if (mobile && document.head) {
        const createdViewportMeta = document.querySelector('meta[name="viewport"][content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"]');
        if (createdViewportMeta) {
          document.head.removeChild(createdViewportMeta);
        }
      }
    };
  }, []);

  // تطبيق الإجراءات الأمنية عند التركيب
  useEffect(() => {
    if (videoRef.current) {
      // تطبيق إجراءات أمنية بسيطة على عنصر الفيديو
      if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
        videoRef.current.controlsList?.add('nodownload');
        videoRef.current.setAttribute('oncontextmenu', 'return false;');
      }
      
      // إعدادات محددة للأجهزة المحمولة
      if (isMobile) {
        videoRef.current.style.objectFit = 'contain';
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.setAttribute('webkit-playsinline', '');
        videoRef.current.setAttribute('x5-playsinline', '');
        videoRef.current.setAttribute('muted', 'false');
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        console.log("تم تطبيق إعدادات الفيديو المخصصة للأجهزة المحمولة");
      }
    }
  }, [isMobile]);

  return {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    isMobile
  };
}
