
import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { Channel } from '@/types';
import { VideoRef, setupVideoSource } from './useVideoSetup';

export function useVideoRetry({ 
  videoRef, 
  channel,
  setIsLoading,
  setError,
  setIsPlaying 
}: { 
  videoRef: VideoRef; 
  channel: Channel;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3; // عدد المحاولات الأقصى
  const [lastRetryTime, setLastRetryTime] = useState(0);
  const minRetryInterval = 3000; // الفاصل الزمني الأدنى بين محاولات إعادة المحاولة (3 ثوانٍ)

  // وظيفة لتنظيف مشغل الفيديو قبل إعادة المحاولة
  const cleanupVideoPlayer = useCallback(() => {
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
  }, [videoRef]);

  // وظيفة إعادة المحاولة محسّنة مع تجنب إعادة المحاولات المتكررة
  const retryPlayback = useCallback(() => {
    const now = Date.now();
    
    // التحقق من الفاصل الزمني المناسب بين المحاولات
    if (now - lastRetryTime < minRetryInterval) {
      console.log("تم طلب إعادة المحاولة بسرعة كبيرة، تأجيل...");
      
      // تعيين مؤقت لإعادة المحاولة بعد الفاصل الزمني المناسب
      setTimeout(() => {
        retryPlayback();
      }, minRetryInterval - (now - lastRetryTime));
      
      return;
    }
    
    console.log("بدء إعادة المحاولة اليدوية");
    setLastRetryTime(now);
    setError(null);
    setIsLoading(true);
    setRetryCount(prevCount => prevCount + 1);
    
    toast({
      title: "جاري إعادة المحاولة",
      description: "يتم إعادة تشغيل البث...",
      duration: 3000,
    });
    
    // تنظيف المشغل أولاً
    if (cleanupVideoPlayer()) {
      // إضافة تأخير قبل إعادة المحاولة للمساعدة في حل مشاكل التخزين المؤقت
      setTimeout(() => {
        if (!videoRef.current) return;
        
        try {
          // تعيين خصائص مختلفة للفيديو للمساعدة في التشغيل
          videoRef.current.autoplay = true;
          videoRef.current.muted = false;
          videoRef.current.playsInline = true;
          videoRef.current.crossOrigin = "anonymous";
          
          // إضافة سمات لتحسين التوافق
          videoRef.current.setAttribute('playsinline', '');
          videoRef.current.setAttribute('webkit-playsinline', '');
          
          if (setupVideoSource(videoRef.current, channel.streamUrl)) {
            console.log("تم تهيئة مصدر الفيديو بنجاح، جاري محاولة التشغيل");
            
            // محاولة التشغيل مع معالجة الأخطاء
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("نجحت إعادة المحاولة اليدوية");
                  setIsPlaying(true);
                  setIsLoading(false);
                  
                  // عرض رسالة نجاح
                  toast({
                    title: "تم استئناف التشغيل",
                    description: "تم استئناف تشغيل البث بنجاح",
                    duration: 3000,
                  });
                })
                .catch(err => {
                  console.error('خطأ في تشغيل الفيديو عند إعادة المحاولة:', err);
                  
                  // محاولة بديلة لتشغيل الفيديو في حالة NotAllowedError
                  if (err.name === "NotAllowedError") {
                    setError('انقر على الشاشة لبدء التشغيل');
                    setIsLoading(false);
                    
                    // تجربة كتم الصوت لتجاوز قيود التشغيل التلقائي
                    try {
                      console.log("محاولة التشغيل مع كتم الصوت");
                      videoRef.current.muted = true;
                      videoRef.current.play()
                        .then(() => {
                          console.log("نجح التشغيل الصامت، إلغاء الكتم");
                          // إضافة مستمع للنقر لإلغاء كتم الصوت
                          const unmuteOnClick = () => {
                            if (videoRef.current) {
                              videoRef.current.muted = false;
                              setError(null);
                            }
                            document.removeEventListener('click', unmuteOnClick);
                          };
                          document.addEventListener('click', unmuteOnClick, { once: true });
                          
                          setIsPlaying(true);
                          setIsLoading(false);
                        })
                        .catch(muteErr => {
                          console.error('فشل التشغيل حتى مع كتم الصوت:', muteErr);
                          setError('فشل في تشغيل البث. حاول النقر فوق الشاشة لبدء التشغيل');
                        });
                    } catch (e) {
                      console.error('خطأ في محاولة التشغيل الصامت:', e);
                      setError('فشل في تشغيل البث، يرجى المحاولة مرة أخرى');
                    }
                  } else {
                    // معالجة أنواع الأخطاء الأخرى
                    let errorMessage = 'فشل في تشغيل البث، حاول مرة أخرى';
                    
                    if (err.name === "AbortError") {
                      errorMessage = 'تم إلغاء تحميل الفيديو، حاول مرة أخرى';
                    } else if (err.name === "NetworkError" || err.message?.includes('network')) {
                      errorMessage = 'فشل في تحميل الفيديو، تحقق من اتصالك بالإنترنت';
                    }
                    
                    setError(errorMessage);
                    setIsLoading(false);
                  }
                });
            }
          } else {
            setError("فشل في إعداد مصدر الفيديو");
            setIsLoading(false);
          }
        } catch (error) {
          console.error('خطأ أثناء إعادة المحاولة اليدوية:', error);
          setError('حدث خطأ غير متوقع');
          setIsLoading(false);
        }
      }, 600);
    } else {
      // إذا فشل التنظيف، سجل الخطأ وأعلم المستخدم
      setError('فشل في إعادة تحميل مشغل الفيديو، حاول تحديث الصفحة');
      setIsLoading(false);
    }
  }, [videoRef, channel.streamUrl, cleanupVideoPlayer, lastRetryTime, setIsLoading, setError, setIsPlaying]);

  // منطق إعادة المحاولة التلقائية محسّن مع تأخير متزايد
  const handlePlaybackError = useCallback(() => {
    if (retryCount < maxRetries) {
      console.log(`إعادة محاولة تلقائية (${retryCount + 1}/${maxRetries})...`);
      
      // زيادة مدة التأخير بين المحاولات المتتالية بشكل أسي
      const delayMs = Math.min(1000 * Math.pow(2, retryCount), 8000);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        
        // استخدام وظيفة التنظيف المشتركة
        if (cleanupVideoPlayer()) {
          setTimeout(() => {
            if (!videoRef.current) return;
            
            try {
              // إعادة إعداد الفيديو مع تجربة خيارات مختلفة للمحاولات المختلفة
              videoRef.current.playsInline = true;
              videoRef.current.autoplay = true;
              
              // تعديل خيارات الكتم حسب رقم المحاولة (محاولة رقم 2 مع كتم الصوت)
              if (retryCount === 2) {
                videoRef.current.muted = true;
              }
              
              if (setupVideoSource(videoRef.current, channel.streamUrl)) {
                // محاولة التشغيل مع معالجة الأخطاء
                videoRef.current.play().catch(e => {
                  console.error("فشلت إعادة المحاولة التلقائية:", e);
                  
                  // معالجة خاصة لحالة NotAllowedError
                  if (e.name === "NotAllowedError") {
                    setError('انقر للتشغيل، التشغيل التلقائي ممنوع');
                    setIsLoading(false);
                  }
                });
              } else {
                console.error("فشل في إعداد مصدر الفيديو أثناء إعادة المحاولة التلقائية");
              }
            } catch (e) {
              console.error("خطأ في إعادة المحاولة التلقائية:", e);
            }
          }, 500);
        } else {
          setError("فشل في إعادة تهيئة مشغل الفيديو");
          setIsLoading(false);
        }
      }, delayMs);
      
      return true;
    } else {
      setError('تعذر تشغيل البث بعد عدة محاولات. انقر على إعادة المحاولة.');
      setIsLoading(false);
      
      toast({
        title: "تعذر تشغيل القناة",
        description: "يرجى التحقق من اتصالك بالإنترنت وانقر على إعادة المحاولة",
        variant: "destructive",
        duration: 5000,
      });
      
      return false;
    }
  }, [retryCount, maxRetries, videoRef, channel.streamUrl, cleanupVideoPlayer, setIsLoading, setError]);

  return {
    retryCount,
    retryPlayback,
    handlePlaybackError
  };
}
