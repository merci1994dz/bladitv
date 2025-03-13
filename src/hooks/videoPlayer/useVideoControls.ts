
import { useState, useRef, useEffect } from 'react';

export function useVideoControls(isPlaying: boolean) {
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showControls, setShowControls] = useState(true);
  const userActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserActive, setIsUserActive] = useState(true);
  const lastInteractionRef = useRef<number>(Date.now());

  // تحسين معالجة حركة الماوس لعرض/إخفاء عناصر التحكم
  const handleMouseMove = () => {
    const now = Date.now();
    lastInteractionRef.current = now;
    
    // عرض عناصر التحكم ووضع المستخدم كنشط دائمًا عند تحريك الماوس
    setShowControls(true);
    setIsUserActive(true);
    
    // مسح المؤقتات الحالية
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (userActivityTimeoutRef.current) {
      clearTimeout(userActivityTimeoutRef.current);
    }
    
    // تعيين مؤقت لعدم نشاط المستخدم (2.5 ثانية)
    userActivityTimeoutRef.current = setTimeout(() => {
      // تحقق من آخر تفاعل للتأكد من عدم وجود تفاعلات جديدة
      if (now === lastInteractionRef.current) {
        setIsUserActive(false);
      }
    }, 2500);
    
    // تعيين مؤقت جديد لإخفاء عناصر التحكم بعد 3 ثوانٍ إذا كان الفيديو قيد التشغيل
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        // تحقق مرة أخرى من آخر تفاعل
        if (now === lastInteractionRef.current && !isUserActive) {
          setShowControls(false);
        }
      }, 3000);
    }
  };

  // عرض عناصر التحكم عند توقف الفيديو
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      // مسح أي مؤقت موجود
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else if (isPlaying && showControls) {
      // عرض عناصر التحكم لفترة وجيزة عند بدء التشغيل
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // إخفاء بعد تأخير قصير (2 ثانية)
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isUserActive) {
          setShowControls(false);
        }
      }, 2000);
    }
  }, [isPlaying, isUserActive]);

  // معالجة تغيير وضع ملء الشاشة
  useEffect(() => {
    const handleFullscreenChange = () => {
      // عرض عناصر التحكم دائمًا عند الدخول إلى وضع ملء الشاشة أو الخروج منه
      setShowControls(true);
      lastInteractionRef.current = Date.now();
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // إخفاء عناصر التحكم بعد تأخير إذا كان الفيديو قيد التشغيل
      if (isPlaying && document.fullscreenElement) {
        controlsTimeoutRef.current = setTimeout(() => {
          // فقط إذا لم يكن هناك تفاعل جديد في الفترة الفاصلة
          if (Date.now() - lastInteractionRef.current >= 3000) {
            setShowControls(false);
          }
        }, 3000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // معالجة أحداث لوحة المفاتيح
    const handleKeyDown = (e: KeyboardEvent) => {
      // عرض عناصر التحكم عند الضغط على أي مفتاح
      setShowControls(true);
      setIsUserActive(true);
      lastInteractionRef.current = Date.now();
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          // فقط إذا لم يكن هناك تفاعل جديد في الفترة الفاصلة
          if (Date.now() - lastInteractionRef.current >= 3000) {
            setShowControls(false);
          }
        }, 3000);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      // مسح أي مؤقتات
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (userActivityTimeoutRef.current) {
        clearTimeout(userActivityTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  return {
    showControls,
    handleMouseMove,
    isUserActive
  };
}
