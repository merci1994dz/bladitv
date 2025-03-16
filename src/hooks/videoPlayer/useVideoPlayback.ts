
import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoEvents } from './useVideoEvents';
import { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  // إعداد حالة الفيديو الأساسية والمراجع
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError,
    isMobile
  } = useVideoSetup();

  // إنشاء مرجع لتتبع القناة الحالية
  const currentChannelRef = useRef(channel);
  
  // إضافة حالة لتتبع اكتمال التحميل وحالة الاتصال
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // إعداد عناصر التحكم في تشغيل الفيديو
  const {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo
  } = useVideoControl({
    videoRef,
    setIsLoading,
    setError
  });

  // إعداد منطق إعادة المحاولة - محسّن
  const {
    retryCount,
    retryPlayback,
    handlePlaybackError
  } = useVideoRetry({
    videoRef,
    channel,
    setIsLoading,
    setError,
    setIsPlaying
  });

  // تحديث مرجع القناة الحالية عند تغيير القناة
  useEffect(() => {
    // تسجيل معلومات القناة الجديدة
    if (currentChannelRef.current?.id !== channel?.id) {
      console.log("تغيير القناة من", currentChannelRef.current?.name || 'لا يوجد', "إلى", channel?.name || 'لا يوجد');
      
      // إعادة ضبط حالة الفيديو
      setIsLoading(true);
      setError(null);
      setIsVideoReady(false);
      setConnectionAttempts(0);
      
      // عرض إشعار بتغيير القناة
      toast({
        title: `جاري تشغيل ${channel?.name}`,
        description: "يتم تحميل البث...",
        duration: 3000,
      });
      
      // إعادة تحميل الفيديو مع تأخير صغير
      setTimeout(() => {
        if (videoRef.current) {
          try {
            // إيقاف التشغيل أولاً
            videoRef.current.pause();
            // تنظيف وتهيئة عناصر الفيديو
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
          } catch (e) {
            console.error("خطأ في إعادة تحميل الفيديو:", e);
          }
        }
      }, 100);
    }
    
    currentChannelRef.current = channel;
  }, [channel, setIsLoading, setError]);

  // إضافة معالج لحدث canplay مع خيارات إضافية للتوافق
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleCanPlay = () => {
      console.log("الفيديو جاهز للتشغيل (canplay)");
      setIsVideoReady(true);
      setIsLoading(false);
      
      // محاولة التشغيل التلقائي
      if (videoElement) {
        videoElement.play()
          .then(() => {
            setIsPlaying(true);
            console.log("تم تشغيل الفيديو تلقائيًا بعد canplay");
          })
          .catch((err) => {
            // قد يكون التشغيل التلقائي ممنوعًا على بعض المتصفحات
            console.log("خطأ في التشغيل التلقائي بعد canplay:", err);
            
            // لا نعتبر هذا خطأ - قد يحتاج المستخدم إلى التفاعل
            if (err.name === 'NotAllowedError') {
              console.log("التشغيل التلقائي ممنوع، بانتظار تفاعل المستخدم");
              setError('انقر للتشغيل');
              
              // محاولة بديلة مع كتم الصوت
              try {
                videoElement.muted = true;
                videoElement.play().then(() => {
                  // إضافة مستمع للنقر لإلغاء كتم الصوت
                  const unmuteOnClick = () => {
                    videoElement.muted = false;
                    setError(null);
                    document.body.removeEventListener('click', unmuteOnClick);
                  };
                  document.body.addEventListener('click', unmuteOnClick, { once: true });
                }).catch(e => {
                  console.log("فشلت محاولة التشغيل الصامت:", e);
                });
              } catch (e) {
                console.error("خطأ في محاولة التشغيل الصامت:", e);
              }
            }
          });
      }
    };
    
    // إضافة معالج إضافي للتحميل المستمر (للأجهزة المحمولة)
    const handleLoadedData = () => {
      console.log("تم تحميل بيانات الفيديو (loadeddata)");
      
      // خاص بالأجهزة المحمولة - تحسين تجربة التحميل
      if (isMobile) {
        setTimeout(() => {
          setIsVideoReady(true);
          setIsLoading(false);
        }, 300);
      }
    };
    
    // معالج البث المستمر للتعامل مع استئناف التشغيل بعد التوقف
    const handleProgress = () => {
      if (isLoading && videoElement && videoElement.readyState >= 3) {
        console.log("تقدم التحميل كافٍ للتشغيل");
        setIsLoading(false);
      }
    };
    
    // معالج جديد للتعامل مع أخطاء تحميل البث
    const handleLoadError = () => {
      setConnectionAttempts(prev => {
        const newCount = prev + 1;
        console.log(`محاولة اتصال ${newCount}`);
        
        if (newCount >= 3 && !isVideoReady) {
          setError("تعذر الاتصال بخادم البث");
        }
        
        return newCount;
      });
    };
    
    // إضافة مؤقت للتحقق من نجاح الاتصال
    const connectionTimeout = setTimeout(() => {
      if (!isVideoReady && videoElement && videoElement.readyState < 3) {
        console.warn("تجاوز مهلة الاتصال - إعادة تحميل تلقائية");
        handleLoadError();
        
        if (connectionAttempts < 2) {
          // إعادة تحميل الفيديو تلقائيًا
          if (videoElement) {
            try {
              videoElement.load();
            } catch (e) {
              console.error("خطأ في إعادة تحميل الفيديو:", e);
            }
          }
        }
      }
    }, 8000);
    
    if (videoElement) {
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('progress', handleProgress);
      
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('progress', handleProgress);
        clearTimeout(connectionTimeout);
      };
    }
    
    return () => {
      clearTimeout(connectionTimeout);
    };
  }, [videoRef, setIsLoading, setIsPlaying, isMobile, isLoading, isVideoReady, connectionAttempts]);

  // إعداد مستمعي أحداث الفيديو الأساسية
  useVideoEvents({
    videoRef,
    channel,
    isPlaying,
    setIsPlaying,
    setIsLoading,
    setError,
    retryCount,
    handlePlaybackError
  });
  
  // تسجيل معلومات تصحيح الأخطاء
  useEffect(() => {
    // تقليل شدة التسجيل للمعلومات الشائعة
    if (error || retryCount > 0 || (!isLoading && !isPlaying)) {
      console.log("معلومات الفيديو:", {
        name: channel?.name || 'لا يوجد',
        streamUrl: channel?.streamUrl ? "موجود" : "مفقود",
        isMobile,
        isPlaying,
        isLoading,
        isVideoReady,
        retryCount,
        connectionAttempts,
        error: error || "لا يوجد خطأ"
      });
    }
  }, [channel, isMobile, isPlaying, isLoading, isVideoReady, error, retryCount, connectionAttempts]);

  return {
    videoRef,
    isPlaying,
    isLoading,
    isVideoReady,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  };
}
