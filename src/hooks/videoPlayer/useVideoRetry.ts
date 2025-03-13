
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

  // إعادة المحاولة بعد حدوث خطأ
  const retryPlayback = () => {
    console.log("Retrying playback manually");
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    toast({
      title: "جاري إعادة المحاولة",
      description: "يتم إعادة تشغيل البث...",
      duration: 3000,
    });
    
    if (videoRef.current) {
      // إعادة ضبط كاملة
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // تعيين مصدر جديد مع تأخير طفيف
      setTimeout(() => {
        if (videoRef.current) {
          try {
            if (setupVideoSource(videoRef.current, channel.streamUrl)) {
              videoRef.current.load();
              
              // محاولة التشغيل
              const playPromise = videoRef.current.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("Manual retry successful");
                    setIsPlaying(true);
                    setIsLoading(false);
                    
                    toast({
                      title: "تم التشغيل بنجاح",
                      description: `يتم الآن تشغيل ${channel.name}`,
                      duration: 3000,
                    });
                  })
                  .catch(err => {
                    console.error('Error playing video on retry:', err);
                    setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى لاحقًا.');
                    setIsLoading(false);
                    
                    toast({
                      title: "فشل في التشغيل",
                      description: "تعذر تشغيل البث بعد المحاولة اليدوية",
                      variant: "destructive",
                      duration: 4000,
                    });
                  });
              }
            }
          } catch (error) {
            console.error('Error during manual retry:', error);
            setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.');
            setIsLoading(false);
          }
        }
      }, 1000);
    }
  };

  // منطق إعادة المحاولة التلقائية
  const handlePlaybackError = () => {
    // زيادة عداد المحاولات فقط إذا كان هناك خطأ حقيقي
    if (retryCount < maxRetries) {
      console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
      setRetryCount(prev => prev + 1);
      
      return true; // يجب إعادة المحاولة تلقائيًا
    } else {
      setError('تعذر تشغيل البث. تأكد من صلاحية الرابط أو جرب قناة أخرى.');
      setIsLoading(false);
      setIsPlaying(false);
      
      toast({
        title: "تعذر تشغيل القناة",
        description: `فشل في تشغيل ${channel.name} بعد عدة محاولات. يرجى التحقق من اتصال الإنترنت أو جرب قناة أخرى.`,
        variant: "destructive",
        duration: 5000,
      });
      
      return false; // لا ينبغي إعادة المحاولة تلقائيًا
    }
  };

  return {
    retryCount,
    retryPlayback,
    handlePlaybackError
  };
}
