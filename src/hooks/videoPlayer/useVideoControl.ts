
import { useState } from 'react';
import { VideoRef } from './useVideoSetup';
import { toast } from "@/hooks/use-toast";

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
    
    console.log("Toggling play/pause. Current state:", isPlaying ? "playing" : "paused");
    
    if (isPlaying) {
      try {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log("Video paused successfully");
      } catch (e) {
        console.error("Error pausing video:", e);
      }
    } else {
      try {
        // Reset error message before playing
        setError(null);
        
        // Make sure playsInline is set for mobile
        videoRef.current.playsInline = true;
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video started playing");
              setIsPlaying(true);
            })
            .catch(err => {
              console.error('Error playing video:', err);
              
              // Special handling for autoplay restrictions
              if (err.name === "NotAllowedError") {
                console.log("Play permission error - likely autoplay restrictions");
                toast({
                  title: "انقر مرة أخرى للتشغيل",
                  description: "اضغط مرة أخرى للتشغيل",
                  duration: 3000,
                });
              } else {
                setError(`فشل في تشغيل الفيديو`);
              }
            });
        }
      } catch (error) {
        console.error('General error trying to play:', error);
        setError('فشل في تشغيل البث. حاول مرة أخرى.');
      }
    }
  };
  
  // Video seek function
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
