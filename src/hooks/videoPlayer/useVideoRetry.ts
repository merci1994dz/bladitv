
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
  const maxRetries = 3; // عدد محاولات أقل

  // Simple retry function
  const retryPlayback = () => {
    console.log("Manual retry initiated");
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
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      setTimeout(() => {
        if (videoRef.current) {
          try {
            setupVideoSource(videoRef.current, channel.streamUrl);
            videoRef.current.load();
            
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Manual retry successful");
                  setIsPlaying(true);
                  setIsLoading(false);
                })
                .catch(err => {
                  console.error('Error playing video on retry:', err);
                  setError('فشل في تشغيل البث');
                  setIsLoading(false);
                });
            }
          } catch (error) {
            console.error('Error during manual retry:', error);
            setError('حدث خطأ غير متوقع');
            setIsLoading(false);
          }
        }
      }, 1000);
    }
  };

  // Simple auto-retry logic
  const handlePlaybackError = () => {
    if (retryCount < maxRetries) {
      console.log(`Auto-retry (${retryCount + 1}/${maxRetries})...`);
      setRetryCount(prev => prev + 1);
      return true; // continue auto-retry
    } else {
      setError('تعذر تشغيل البث. جرب قناة أخرى.');
      setIsLoading(false);
      setIsPlaying(false);
      
      toast({
        title: "تعذر تشغيل القناة",
        description: "فشل في تشغيل القناة بعد عدة محاولات",
        variant: "destructive",
        duration: 5000,
      });
      
      return false; // stop auto-retry
    }
  };

  return {
    retryCount,
    retryPlayback,
    handlePlaybackError
  };
}
