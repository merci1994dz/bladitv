
import { VideoRef, setupVideoSource } from './useVideoSetup';
import { Channel } from '@/types';
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
      // Clear the video player first
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // Set some essential attributes for mobile
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = false; // Let the play logic handle this
      videoRef.current.muted = false;
      
      // Setup the source and add event handlers
      if (setupVideoSource(videoRef.current, channel.streamUrl)) {
        console.log("Video source set up successfully");
        
        // Basic event handlers
        videoRef.current.oncanplay = () => {
          console.log("Video can play now");
          setIsLoading(false);
        };
        
        videoRef.current.onplaying = () => {
          console.log("Video has started playing");
          setIsLoading(false);
        };
        
        videoRef.current.onerror = () => {
          console.error("Error loading video");
          setError('فشل في تحميل الفيديو');
          setIsLoading(false);
        };
        
        // Attempt to play with delay for mobile
        setTimeout(() => {
          if (!videoRef.current) return;
          
          try {
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                console.error("Play error:", err.name);
                
                // Handle autoplay restrictions
                if (err.name === "NotAllowedError") {
                  console.log("Autoplay restricted - user needs to interact");
                  setIsLoading(false);
                  setError('انقر للتشغيل');
                  
                  toast({
                    title: "انقر للتشغيل",
                    description: "انقر على الشاشة لبدء البث",
                    duration: 3000,
                  });
                }
              });
            }
          } catch (e) {
            console.error("General play error:", e);
          }
        }, 300);
      } else {
        setError("فشل في إعداد مصدر الفيديو");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error initializing video:", err);
      setError("حدث خطأ أثناء تحميل الفيديو");
      setIsLoading(false);
    }
  };

  return { initializeVideoPlayback };
}
