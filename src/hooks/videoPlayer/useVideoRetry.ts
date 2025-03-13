
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
  const maxRetries = 1; // Reduced to minimize delay and frustration

  // Simple retry function
  const retryPlayback = () => {
    console.log("Starting manual retry");
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    toast({
      title: "جاري إعادة المحاولة",
      description: "يتم إعادة تشغيل البث...",
      duration: 3000,
    });
    
    if (videoRef.current) {
      // Basic reset
      try {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      } catch (e) {
        console.error("Error resetting video:", e);
      }
      
      // Add short delay before retrying
      setTimeout(() => {
        if (!videoRef.current) return;
        
        try {
          if (setupVideoSource(videoRef.current, channel.streamUrl)) {
            // Set essential attributes for mobile
            videoRef.current.playsInline = true;
            
            // Try to play
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Manual retry succeeded");
                  setIsPlaying(true);
                  setIsLoading(false);
                })
                .catch(err => {
                  console.error('Error playing video on retry:', err);
                  
                  // Handle autoplay restrictions
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
          console.error('Error during manual retry:', error);
          setError('حدث خطأ غير متوقع');
          setIsLoading(false);
        }
      }, 300);
    }
  };

  // Simplified auto-retry logic
  const handlePlaybackError = () => {
    if (retryCount < maxRetries) {
      console.log(`Auto-retry (${retryCount + 1}/${maxRetries})...`);
      setRetryCount(prev => prev + 1);
      return true;
    } else {
      setError('تعذر تشغيل البث. حاول مرة أخرى.');
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
