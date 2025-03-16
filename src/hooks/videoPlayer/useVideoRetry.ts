
import { useState } from 'react';
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
  const maxRetries = 3; // زيادة عدد المحاولات

  // وظيفة إعادة المحاولة محسّنة
  const retryPlayback = () => {
    console.log("بدء إعادة المحاولة اليدوية");
    setError(null);
    setIsLoading(true);
    setRetryCount(prevCount => prevCount + 1);
    
    toast({
      title: "جاري إعادة المحاولة",
      description: "يتم إعادة تشغيل البث...",
      duration: 3000,
    });
    
    if (videoRef.current) {
      // إعادة تعيين أساسية بشكل أكثر قوة
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src'); // أكثر فعالية من تعيين سلسلة فارغة
        videoRef.current.load();
      } catch (e) {
        console.error("خطأ في إعادة تعيين الفيديو:", e);
      }
      
      // إضافة تأخير قبل إعادة المحاولة للمساعدة في حل مشاكل التخزين المؤقت
      setTimeout(() => {
        if (!videoRef.current) return;
        
        try {
          // تعيين خصائص مختلفة للفيديو للمساعدة في التشغيل
          videoRef.current.autoplay = true;
          videoRef.current.muted = false;
          videoRef.current.playsInline = true;
          videoRef.current.crossOrigin = "anonymous";
          
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
                          // إلغاء كتم الصوت بعد بدء التشغيل
                          setTimeout(() => {
                            if (videoRef.current) {
                              videoRef.current.muted = false;
                            }
                          }, 1000);
                          setIsPlaying(true);
                          setIsLoading(false);
                          setError(null);
                        })
                        .catch(muteErr => {
                          console.error('فشل التشغيل حتى مع كتم الصوت:', muteErr);
                        });
                    } catch (e) {
                      console.error('خطأ في محاولة التشغيل الصامت:', e);
                    }
                  } else {
                    setError('فشل في تشغيل البث، حاول مرة أخرى');
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
      }, 800); // زيادة التأخير قليلاً
    }
  };

  // منطق إعادة المحاولة التلقائية محسّن
  const handlePlaybackError = () => {
    if (retryCount < maxRetries) {
      console.log(`إعادة محاولة تلقائية (${retryCount + 1}/${maxRetries})...`);
      
      // زيادة مدة التأخير بين المحاولات المتتالية
      const delayMs = 1000 + (retryCount * 500);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        
        if (videoRef.current) {
          try {
            // تنظيف الفيديو أولاً
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            
            // إعادة إعداد الفيديو مع تجربة خيارات مختلفة للمحاولات المختلفة
            videoRef.current.playsInline = true;
            
            // تجربة مصادر بديلة إذا كانت متوفرة
            const source = channel.streamUrl; // استخدم المصدر الأصلي للآن
            
            if (setupVideoSource(videoRef.current, source)) {
              // محاولة التشغيل مع معالجة الأخطاء
              videoRef.current.play().catch(e => {
                console.error("فشلت إعادة المحاولة التلقائية:", e);
                
                // التعامل مع حالة NotAllowedError
                if (e.name === "NotAllowedError") {
                  setError('انقر للتشغيل، التشغيل التلقائي ممنوع');
                  setIsLoading(false);
                }
              });
            }
          } catch (e) {
            console.error("خطأ في إعادة المحاولة التلقائية:", e);
          }
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
  };

  return {
    retryCount,
    retryPlayback,
    handlePlaybackError
  };
}
