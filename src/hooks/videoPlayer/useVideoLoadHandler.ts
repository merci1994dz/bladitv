
import { VideoRef } from './useVideoSetup';
import { Channel } from '@/types';
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
      // Set up the source
      if (setupVideoSource(videoRef.current, channel.streamUrl)) {
        console.log("Video source set up successfully");
        
        // Attempt to play with delay for better mobile compatibility
        setTimeout(() => {
          if (videoRef.current) {
            console.log("Attempting to play video");
            try {
              const playPromise = videoRef.current.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("Video playback started successfully");
                    setIsLoading(false);
                  })
                  .catch(err => {
                    console.error("Play error:", err);
                    
                    // Handle autoplay restrictions (common on mobile)
                    if (err.name === "NotAllowedError") {
                      setIsLoading(false);
                      toast({
                        title: "التشغيل التلقائي محظور",
                        description: "انقر على الفيديو للتشغيل",
                        duration: 5000,
                      });
                    } else {
                      setError("فشل في تشغيل الفيديو. يرجى المحاولة مجددًا.");
                      setIsLoading(false);
                    }
                  });
              }
            } catch (playError) {
              console.error("Error during play:", playError);
              setError("حدث خطأ أثناء محاولة التشغيل");
              setIsLoading(false);
            }
          }
        }, 1000);
      } else {
        setError("فشل في تهيئة مصدر الفيديو");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Video initialization error:", err);
      setError("حدث خطأ أثناء تحميل الفيديو");
      setIsLoading(false);
    }
  };

  return { initializeVideoPlayback };
}
