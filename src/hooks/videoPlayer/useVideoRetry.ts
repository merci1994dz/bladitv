
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
  const maxRetries = 2; // تقليل عدد المحاولات

  // وظيفة إعادة المحاولة البسيطة
  const retryPlayback = () => {
    console.log("بدء إعادة المحاولة اليدوية");
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    toast({
      title: "جاري إعادة المحاولة",
      description: "يتم إعادة تشغيل البث...",
      duration: 3000,
    });
    
    if (videoRef.current) {
      // إعادة تعيين أساسية
      try {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      } catch (e) {
        console.error("خطأ أثناء إعادة تعيين الفيديو:", e);
      }
      
      setTimeout(() => {
        if (videoRef.current) {
          try {
            // تنظيف أي أحداث قبل إعادة المحاولة
            videoRef.current.oncanplay = null;
            videoRef.current.onplaying = null;
            videoRef.current.onerror = null;
            
            if (setupVideoSource(videoRef.current, channel.streamUrl)) {
              // إضافة مراقبي الأحداث للتشغيل اليدوي
              videoRef.current.oncanplay = () => {
                console.log("الفيديو جاهز للتشغيل بعد إعادة المحاولة");
                setIsLoading(false);
              };
              
              videoRef.current.onplaying = () => {
                console.log("بدأ تشغيل الفيديو بعد إعادة المحاولة");
                setIsPlaying(true);
                setIsLoading(false);
              };
              
              videoRef.current.onerror = () => {
                console.error("خطأ بعد إعادة المحاولة");
                setError("فشلت محاولة إعادة التشغيل");
                setIsLoading(false);
              };
              
              // محاولة التشغيل
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("نجحت إعادة المحاولة اليدوية");
                  })
                  .catch(err => {
                    console.error('خطأ في تشغيل الفيديو عند إعادة المحاولة:', err);
                    
                    // التعامل مع قيود التشغيل التلقائي
                    if (err.name === "NotAllowedError") {
                      setError('انقر على الشاشة لبدء التشغيل');
                      setIsLoading(false);
                    } else {
                      setError('فشل في تشغيل البث');
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
        }
      }, 500);
    }
  };

  // منطق إعادة المحاولة التلقائي المبسط
  const handlePlaybackError = () => {
    if (retryCount < maxRetries) {
      console.log(`إعادة محاولة تلقائية (${retryCount + 1}/${maxRetries})...`);
      setRetryCount(prev => prev + 1);
      return true; // متابعة إعادة المحاولة التلقائية
    } else {
      setError('تعذر تشغيل البث. جرب قناة أخرى أو انقر على إعادة المحاولة.');
      setIsLoading(false);
      setIsPlaying(false);
      
      toast({
        title: "تعذر تشغيل القناة",
        description: "فشل في تشغيل القناة بعد عدة محاولات",
        variant: "destructive",
        duration: 5000,
      });
      
      return false; // إيقاف إعادة المحاولة التلقائية
    }
  };

  return {
    retryCount,
    retryPlayback,
    handlePlaybackError
  };
}
