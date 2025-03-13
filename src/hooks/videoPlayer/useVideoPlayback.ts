import { Channel } from '@/types';
import { useVideoSetup } from './useVideoSetup';
import { useVideoRetry } from './useVideoRetry';
import { useVideoControl } from './useVideoControl';
import { useVideoEvents } from './useVideoEvents';
import { useEffect, useRef } from 'react';
import { VIDEO_PLAYER } from '@/services/config';
import { toast } from "@/hooks/use-toast";

interface UseVideoPlaybackProps {
  channel: Channel;
}

export function useVideoPlayback({ channel }: UseVideoPlaybackProps) {
  // منع تسريب روابط البث عبر console logs
  const secureChannel = VIDEO_PLAYER.HIDE_STREAM_URLS ? {
    ...channel,
    streamUrl: channel.streamUrl // الحقيقي يبقى للاستخدام الداخلي فقط
  } : channel;

  // Set up core video state and refs
  const {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError
  } = useVideoSetup();

  // Create a ref to keep track of current channel ID
  const currentChannelIdRef = useRef(channel.id);
  
  // Set up video playback controls
  const {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo
  } = useVideoControl({
    videoRef,
    setIsLoading,
    setError
  });

  // Set up retry logic
  const {
    retryCount,
    retryPlayback,
    handlePlaybackError
  } = useVideoRetry({
    videoRef,
    channel: secureChannel,
    setIsLoading,
    setError,
    setIsPlaying
  });

  // Set up video event listeners
  useVideoEvents({
    videoRef,
    channel: secureChannel,
    isPlaying,
    setIsPlaying,
    setIsLoading,
    setError,
    retryCount,
    handlePlaybackError
  });
  
  // إعادة تهيئة المشغل عند تغيير القناة
  useEffect(() => {
    console.log("Channel changed in useVideoPlayback:", channel.name);
    
    // تهيئة مشغل الفيديو أو إعادة تعيينه
    setIsLoading(true);
    setError(null);
    
    // التحقق من وجود رابط بث
    if (!channel.streamUrl) {
      console.error("Missing stream URL for channel:", channel.name);
      setError("لا يوجد رابط بث متاح لهذه القناة");
      setIsLoading(false);
      
      toast({
        title: "تعذر تشغيل القناة",
        description: "لا يوجد رابط بث متاح لهذه القناة",
        variant: "destructive",
        duration: 4000,
      });
      
      return;
    }
    
    if (currentChannelIdRef.current !== channel.id) {
      console.log("Resetting player for new channel:", channel.name);
      currentChannelIdRef.current = channel.id;
      
      // محاولة تشغيل القناة الجديدة بعد فترة أطول للسماح بالتهيئة
      setTimeout(() => {
        if (videoRef.current) {
          try {
            console.log("Attempting to load and play new channel");
            videoRef.current.load();
            
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                console.error('Failed to auto-play new channel:', err);
                // لا نعرض خطأ للمستخدم هنا لأن النظام سيحاول مرة أخرى تلقائيًا
              });
            }
          } catch (err) {
            console.error('Error during initial play attempt:', err);
          }
        }
      }, 1500); // زيادة التأخير للسماح للمتصفح بتهيئة مشغل الفيديو
    }
  }, [channel.id, channel.streamUrl]);

  return {
    videoRef,
    isPlaying,
    isLoading,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  };
}
