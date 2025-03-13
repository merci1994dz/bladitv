
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
    
    console.log("محاولة تبديل التشغيل/الإيقاف. الحالة الحالية:", isPlaying ? "قيد التشغيل" : "متوقف");
    
    if (isPlaying) {
      try {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log("تم إيقاف الفيديو بنجاح");
      } catch (e) {
        console.error("خطأ عند إيقاف الفيديو:", e);
      }
    } else {
      try {
        // محاولة إعادة تعيين رسالة الخطأ قبل التشغيل
        setError(null);
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("بدأ تشغيل الفيديو");
              setIsPlaying(true);
            })
            .catch(err => {
              console.error('خطأ في تشغيل الفيديو:', err);
              
              // معالجة خاصة لقيود التشغيل التلقائي
              if (err.name === "NotAllowedError") {
                console.log("خطأ إذن التشغيل - يحتمل أن يكون بسبب قيود التشغيل التلقائي");
                toast({
                  title: "تشغيل غير مسموح به",
                  description: "قم بالنقر مرة أخرى لبدء التشغيل يدويًا",
                  duration: 5000,
                });
              } else {
                setError(`فشل في تشغيل الفيديو: ${err.message || 'خطأ غير معروف'}`);
              }
            });
        } else {
          // الطريقة التقليدية، لتوافق أفضل
          console.log("استخدام معالجات الأحداث التقليدية للتشغيل");
          videoRef.current.onplay = () => {
            console.log("بدأ تشغيل الفيديو (طريقة تقليدية)");
            setIsPlaying(true);
          };
          
          videoRef.current.onerror = () => {
            console.error("خطأ أثناء التشغيل (طريقة تقليدية)");
            setError("فشل في تشغيل البث");
          };
        }
      } catch (error) {
        console.error('خطأ عام في محاولة التشغيل:', error);
        setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
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
        // العديد من البث المباشر لا تدعم البحث، لذا تجاهل الخطأ فقط
      }
    }
  };

  return {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo
  };
}
