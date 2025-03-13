
import { useRef, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Channel } from '@/types';

export interface VideoRef {
  current: HTMLVideoElement | null;
}

// Setup video stream source
export function setupVideoSource(video: HTMLVideoElement, src: string): boolean {
  if (!src) {
    console.error('Stream URL is empty or invalid');
    return false;
  }

  console.log('Setting up video with source:', src);
  
  try {
    // Set source directly
    video.src = src;
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
