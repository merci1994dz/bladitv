
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
  const maxRetries = 2; // عدد محاولات معقول

  // وظيفة إعادة المحاولة البسيطة
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
      // إعادة تعيين أساسية
      try {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      } catch (e) {
        console.error("خطأ في إعادة تعيين الفيديو:", e);
      }
      
      // إضافة تأخير قصير قبل إعادة المحاولة
      setTimeout(() => {
        if (!videoRef.current) return;
        
        try {
          if (setupVideoSource(videoRef.current, channel.streamUrl)) {
            // تعيين السمات الأساسية للأجهزة المحمولة
            videoRef.current.playsInline = true;
            
            // محاولة التشغيل
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
      }, 500);
    }
  };

  // منطق إعادة المحاولة التلقائية المبسط
  const handlePlaybackError = () => {
    if (retryCount < maxRetries) {
      console.log(`إعادة محاولة تلقائية (${retryCount + 1}/${maxRetries})...`);
      
      // تأخير إعادة المحاولة للتوافق مع الأجهزة المحمولة
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        
        if (videoRef.current) {
          try {
            if (setupVideoSource(videoRef.current, channel.streamUrl)) {
              videoRef.current.play().catch(e => {
                console.error("فشلت إعادة المحاولة التلقائية:", e);
              });
            }
          } catch (e) {
            console.error("خطأ في إعادة المحاولة التلقائية:", e);
          }
        }
      }, 1000);
      
      return true;
    } else {
      setError('تعذر تشغيل البث. انقر على إعادة المحاولة.');
      setIsLoading(false);
      
      toast({
        title: "تعذر تشغيل القناة",
        description: "انقر على إعادة المحاولة",
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
