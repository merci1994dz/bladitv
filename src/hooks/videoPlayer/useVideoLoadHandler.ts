
import { VideoRef } from './useVideoSetup';
import { Channel } from '@/types';
import { VIDEO_PLAYER } from '@/services/config';
import { setupVideoSource } from './useVideoSetup';
import { toast } from "@/hooks/use-toast";

export function useVideoLoadHandler() {
  const initializeVideoPlayback = (
    videoRef: VideoRef,
    channel: Channel,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ) => {
    if (!videoRef.current) {
      console.error('Video ref is not available');
      return;
    }
    
    if (!channel.streamUrl) {
      console.error('Channel stream URL is empty');
      setError('لا يوجد رابط بث متاح لهذه القناة');
      setIsLoading(false);
      
      toast({
        title: "خطأ في البث",
        description: "لا يوجد رابط بث متاح لهذه القناة",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    // سجلات آمنة - إخفاء عناوين URL الفعلية في وحدة التحكم
    if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
      console.log('Initializing video player for channel:', channel.name);
      console.log('Stream URL:', '[محمي]');
    } else {
      console.log('Initializing video player for channel:', channel.name);
      console.log('Stream URL:', channel.streamUrl);
    }
    
    // إعداد مصدر جديد ومحاولة التشغيل مع تحسين الأمان
    try {
      // أولاً، تنظيف الوسائط الموجودة
      const video = videoRef.current;
      video.pause();
      
      // إزالة كل مصادر الفيديو الحالية
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }
      
      video.removeAttribute('src');
      video.load();
      
      if (setupVideoSource(video, channel.streamUrl)) {
        // إضافة تأخير مناسب للتحميل
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            console.log('Video source loaded, attempting to play');
            
            // إضافة تأخير قبل محاولة التشغيل
            setTimeout(() => {
              if (videoRef.current) {
                try {
                  const playPromise = videoRef.current.play();
                  
                  if (playPromise !== undefined) {
                    playPromise
                      .then(() => {
                        console.log('Initial play successful');
                      })
                      .catch(err => {
                        // سجلات خطأ آمنة
                        if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
                          console.error('Error on initial play:', err instanceof Error ? err.message.replace(/(https?:\/\/[^\s]+)/g, '[محمي]') : 'Unknown error');
                        } else {
                          console.error('Error on initial play:', err);
                        }
                        
                        // إذا تم حظر التشغيل التلقائي، عرض عناصر التحكم فقط
                        if (err.name === "NotAllowedError") {
                          console.log('Autoplay blocked - needs user interaction');
                          toast({
                            title: "التشغيل التلقائي محجوب",
                            description: "يرجى النقر على الفيديو لبدء التشغيل",
                            duration: 5000,
                          });
                        }
                      });
                  }
                } catch (playError) {
                  console.error('Error during play attempt:', playError);
                }
              }
            }, 1000);
          }
        }, 1000);
      }
    } catch (err) {
      // سجلات خطأ آمنة
      if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
        console.error('Unexpected error during video initialization:', err instanceof Error ? err.message.replace(/(https?:\/\/[^\s]+)/g, '[محمي]') : 'Unknown error');
      } else {
        console.error('Unexpected error during video initialization:', err);
      }
      
      setError('حدث خطأ غير متوقع أثناء تحميل الفيديو.');
      setIsLoading(false);
      
      toast({
        title: "خطأ في التشغيل",
        description: "حدث خطأ غير متوقع أثناء تحميل الفيديو",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return { initializeVideoPlayback };
}
