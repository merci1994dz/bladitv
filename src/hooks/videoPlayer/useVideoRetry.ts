
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
  const maxRetries = 2; // Reduced max retries to make the experience smoother

  // Retry playback after error
  const retryPlayback = () => {
    console.log("Retrying playback manually");
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    if (videoRef.current) {
      // Reset completely
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // Set new source with a slight delay
      setTimeout(() => {
        if (videoRef.current) {
          if (setupVideoSource(videoRef.current, channel.streamUrl)) {
            videoRef.current.load();
            
            // Try to play
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
                  setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
                  setIsLoading(false);
                });
            }
          }
        }
      }, 500);
    }
  };

  // Auto-retry logic
  const handlePlaybackError = () => {
    // Only increment retry count if there's a real error
    if (retryCount < maxRetries) {
      console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
      setRetryCount(prev => prev + 1);
      
      return true; // Should auto-retry
    } else {
      setError('تعذر تشغيل البث. تأكد من صلاحية الرابط أو جرب قناة أخرى.');
      setIsLoading(false);
      setIsPlaying(false);
      
      toast({
        title: "تنبيه",
        description: `فشل في تشغيل القناة ${channel.name}. تأكد من صلاحية عنوان البث.`,
        variant: "destructive",
        duration: 5000,
      });
      
      return false; // Should not auto-retry
    }
  };

  return {
    retryCount,
    retryPlayback,
    handlePlaybackError
  };
}
