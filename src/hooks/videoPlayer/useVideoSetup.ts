
import { useRef, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Channel } from '@/types';
import { VIDEO_PLAYER } from '@/services/config';

export interface VideoRef {
  current: HTMLVideoElement | null;
}

// Setup video stream source with security measures
export function setupVideoSource(video: HTMLVideoElement, src: string): boolean {
  if (!src) {
    console.error('Stream URL is empty or invalid');
    return false;
  }

  // تسجيل ملاحظة بدون الكشف عن الرابط الكامل
  console.log('Setting up video source...', 
    VIDEO_PLAYER.HIDE_STREAM_URLS ? '[HIDDEN URL]' : src);
  
  try {
    if (VIDEO_PLAYER.OBFUSCATE_SOURCE) {
      // استخدام MediaSource او Blob URL سيكون أكثر أماناً لكن يتطلب تغييرات أكبر
      // نكتفي الآن بتعيين المصدر مباشرة
      video.src = src;
    } else {
      video.src = src;
    }
    return true;
  } catch (e) {
    console.error('Error setting video source:', e);
    return false;
  }
}

export function useVideoSetup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    videoRef,
    isLoading,
    setIsLoading,
    error,
    setError
  };
}
