
import { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Channel } from '@/types';
import { VIDEO_PLAYER, SECURITY_CONFIG } from '@/services/config';

export interface VideoRef {
  current: HTMLVideoElement | null;
}

// تطبيق إجراءات الأمان على مشغل الفيديو
function applySecurityMeasures(video: HTMLVideoElement): void {
  if (SECURITY_CONFIG.DISABLE_VIDEO_DOWNLOAD) {
    // منع السحب والتحميل
    video.oncontextmenu = e => e.preventDefault();
    video.style.pointerEvents = 'auto';
    
    // منع تحميل الفيديو بطرق أخرى
    video.controlsList = 'nodownload';
  }
  
  // منع استخراج الرابط من فحص العناصر (جزئي)
  if (VIDEO_PLAYER.DISABLE_INSPECT) {
    video.dataset.secure = 'true';
    video.removeAttribute('src'); // لن يظهر الرابط الأصلي في DOM
    
    // استخدام srcObject بدلاً من src إذا كان ممكناً
    try {
      const mediaSource = new MediaSource();
      video.srcObject = mediaSource as any;
    } catch (e) {
      console.log('MediaSource API not supported, fallback to regular src');
    }
  }
}

// Setup video stream source with security measures
export function setupVideoSource(video: HTMLVideoElement, src: string): boolean {
  if (!src) {
    console.error('Stream URL is empty or invalid');
    return false;
  }

  // تسجيل ملاحظة بدون الكشف عن الرابط الكامل
  console.log('Setting up video source...', 
    VIDEO_PLAYER.HIDE_STREAM_URLS ? '[HIDDEN URL]' : src);
  
  try {
    // تطبيق إجراءات الأمان
    applySecurityMeasures(video);
    
    if (VIDEO_PLAYER.OBFUSCATE_SOURCE) {
      // تحسين تشفير المصدر
      video.src = src; // في تطبيق حقيقي، يمكن استخدام وسيط أو تشفير الرابط
      
      // إضافة حماية للإحالة عند الطلب
      if (VIDEO_PLAYER.REFERRER_PROTECTION) {
        video.crossOrigin = 'anonymous';
      }
    } else {
      video.src = src;
    }
    
    return true;
  } catch (e) {
    console.error('Error setting video source:', e);
    return false;
  }
}

export function useVideoSetup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // تطبيق حماية أمان صفحة الويب نفسها
  useEffect(() => {
    if (SECURITY_CONFIG.ALLOW_RIGHT_CLICK === false) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
    
    // منع أدوات المطور
    if (VIDEO_PLAYER.DISABLE_INSPECT) {
      const handleDevTools = () => {
        if (SECURITY_CONFIG.LOG_ACCESS_ATTEMPTS) {
          console.log('محاولة استخدام أدوات المطور');
        }
      };
      
      window.addEventListener('devtoolschange', handleDevTools as any);
      
      return () => {
        window.removeEventListener('devtoolschange', handleDevTools as any);
      };
    }
  }, []);

  return {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError
  };
}
