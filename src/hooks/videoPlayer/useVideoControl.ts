
import { useState } from 'react';
import { VideoRef } from './useVideoSetup';
import { toast } from "@/hooks/use-toast";

export function useVideoControl({ 
  videoRef,
  setIsLoading,
  setError 
}: { 
  videoRef: VideoRef; 
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // تبديل التشغيل/الإيقاف
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    console.log("تبديل التشغيل/الإيقاف. الحالة الحالية:", isPlaying ? "يعمل" : "متوقف");
    
    if (isPlaying) {
      try {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log("تم إيقاف الفيديو بنجاح");
      } catch (e) {
        console.error("خطأ في إيقاف الفيديو:", e);
      }
    } else {
      try {
        // إعادة تعيين رسالة الخطأ قبل التشغيل
        setError(null);
        
        // التأكد من تعيين playsInline للأجهزة المحمولة
        videoRef.current.playsInline = true;
        
        // للأجهزة المحمولة، قد نحتاج إلى كتم الصوت مؤقتًا للتشغيل
        const wasMuted = videoRef.current.muted;
        let needsUnmute = false;
        
        if (videoRef.current.paused && !wasMuted) {
          try {
            // محاولة التشغيل أولاً بدون كتم الصوت
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("بدأ تشغيل الفيديو");
                  setIsPlaying(true);
                })
                .catch(err => {
                  // إذا فشل بسبب قيود التشغيل التلقائي، حاول مع كتم الصوت
                  if (err.name === "NotAllowedError") {
                    console.log("محاولة التشغيل مع كتم الصوت...");
                    videoRef.current!.muted = true;
                    needsUnmute = true;
                    
                    // محاولة أخرى مع كتم الصوت
                    videoRef.current!.play()
                      .then(() => {
                        console.log("تم تشغيل الفيديو بنجاح مع كتم الصوت");
                        setIsPlaying(true);
                        
                        // إلغاء كتم الصوت بعد التشغيل بنجاح
                        setTimeout(() => {
                          if (videoRef.current && needsUnmute) {
                            videoRef.current.muted = false;
                            console.log("تم إلغاء كتم الصوت بعد التشغيل بنجاح");
                          }
                        }, 500);
                      })
                      .catch(muteErr => {
                        console.error('فشل التشغيل حتى مع كتم الصوت:', muteErr);
                        setError('تعذر تشغيل الفيديو. حاول مرة أخرى.');
                      });
                  } else {
                    console.error('خطأ عام في التشغيل:', err);
                    setError(`فشل في تشغيل الفيديو: ${err.message || 'خطأ غير معروف'}`);
                  }
                });
            }
          } catch (error) {
            console.error('خطأ عام في محاولة التشغيل:', error);
            setError('فشل في تشغيل البث. حاول مرة أخرى.');
          }
        } else {
          // إذا كان الفيديو بالفعل مكتوم الصوت، فقط قم بالتشغيل
          try {
            videoRef.current.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch(err => {
                console.error('خطأ في التشغيل:', err);
                setError('فشل في تشغيل البث');
              });
          } catch (error) {
            console.error('خطأ عام:', error);
            setError('فشل في تشغيل البث. حاول مرة أخرى.');
          }
        }
      } catch (error) {
        console.error('خطأ عام في محاولة التشغيل:', error);
        setError('فشل في تشغيل البث. حاول مرة أخرى.');
      }
    }
  };
  
  // وظيفة البحث في الفيديو
  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      try {
        videoRef.current.currentTime += seconds;
      } catch (error) {
        console.error('خطأ في البحث في الفيديو:', error);
        // العديد من البث المباشر لا يدعم البحث، لذا تجاهل الخطأ فقط
      }
    }
  };
  
  // وظائف البحث للأمام والخلف
  const seekForward = () => seekVideo(10);
  const seekBackward = () => seekVideo(-10);

  return {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo,
    seekForward,
    seekBackward
  };
}
