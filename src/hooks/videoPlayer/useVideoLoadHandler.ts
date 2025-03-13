
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
    if (!videoRef.current) return;
    
    if (!channel.streamUrl) {
      setError('لا يوجد رابط بث متاح لهذه القناة');
      setIsLoading(false);
      return;
    }
    
    console.log('Initializing video for channel:', channel.name);
    
    try {
      // Basic clean-up
      const video = videoRef.current;
      video.pause();
      video.removeAttribute('src');
      video.load();
      
      // Set up the source
      if (setupVideoSource(video, channel.streamUrl)) {
        video.load();
        
        // Simplified play attempt
        setTimeout(() => {
          if (videoRef.current) {
            try {
              const playPromise = videoRef.current.play();
              
              if (playPromise !== undefined) {
                playPromise.catch(err => {
                  console.error('Play error:', err);
                  // Handle autoplay restrictions
                  if (err.name === "NotAllowedError") {
                    toast({
                      title: "التشغيل التلقائي محظور",
                      description: "انقر على الفيديو للتشغيل",
                      duration: 5000,
                    });
                  }
                });
              }
            } catch (playError) {
              console.error('Error during play:', playError);
            }
          }
        }, 500);
      }
    } catch (err) {
      console.error('Video initialization error:', err);
      setError('حدث خطأ أثناء تحميل الفيديو');
      setIsLoading(false);
    }
  };

  return { initializeVideoPlayback };
}
