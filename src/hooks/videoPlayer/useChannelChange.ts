
import { useEffect, useRef } from 'react';
import { Channel } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UseChannelChangeProps {
  channel: Channel;
  videoRef: React.RefObject<HTMLVideoElement>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsVideoReady: (ready: boolean) => void;
  setConnectionAttempts: (callback: (prev: number) => number) => void;
}

export function useChannelChange({
  channel,
  videoRef,
  setIsLoading,
  setError,
  setIsVideoReady,
  setConnectionAttempts
}: UseChannelChangeProps) {
  // Reference to track current channel
  const currentChannelRef = useRef(channel);
  
  // Update channel reference when channel changes
  useEffect(() => {
    // Log new channel information
    if (currentChannelRef.current?.id !== channel?.id) {
      console.log("تغيير القناة من", currentChannelRef.current?.name || 'لا يوجد', "إلى", channel?.name || 'لا يوجد');
      
      // Reset video state
      setIsLoading(true);
      setError(null);
      setIsVideoReady(false);
      setConnectionAttempts(() => 0);
      
      // Show channel change notification
      toast({
        title: `جاري تشغيل ${channel?.name}`,
        description: "يتم تحميل البث...",
        duration: 3000,
      });
      
      // Reload video with a small delay
      setTimeout(() => {
        if (videoRef.current) {
          try {
            // Stop playback first
            videoRef.current.pause();
            // Clean and initialize video elements
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
          } catch (e) {
            console.error("خطأ في إعادة تحميل الفيديو:", e);
          }
        }
      }, 100);
    }
    
    currentChannelRef.current = channel;
  }, [channel, setIsLoading, setError, setIsVideoReady, setConnectionAttempts, videoRef]);

  return {
    currentChannelRef
  };
}
