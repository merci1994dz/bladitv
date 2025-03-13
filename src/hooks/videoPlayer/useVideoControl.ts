
import { useState } from 'react';
import { VideoRef } from './useVideoSetup';

export function useVideoControl({ 
  videoRef,
  setIsLoading,
  setError 
}: { 
  videoRef: VideoRef; 
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
          });
      }
    }
  };
  
  // Seek video function
  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      try {
        videoRef.current.currentTime += seconds;
      } catch (error) {
        console.error('Error seeking in video:', error);
        // Many live streams don't support seeking, so just ignore the error
      }
    }
  };

  return {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo
  };
}
