
/**
 * مرفق لإدارة عمليات إعادة المحاولة للفيديو
 */
import { useState } from 'react';
import { Channel } from '@/types';
import { VideoRef } from './useVideoSetup';
import { useManualRetry } from './useManualRetry';
import { useAutoRetry } from './useAutoRetry';

interface UseVideoRetryProps { 
  videoRef: VideoRef; 
  channel: Channel;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
}

/**
 * مرفق رئيسي لإدارة عمليات إعادة المحاولة للفيديو
 */
export function useVideoRetry({ 
  videoRef, 
  channel,
  setIsLoading,
  setError,
  setIsPlaying 
}: UseVideoRetryProps) {
  // حالة إعادة المحاولة
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(0);
  const maxRetries = 3; // عدد المحاولات الأقصى
  
  // استخدام مرفق إعادة المحاولة اليدوية
  const { retryPlayback } = useManualRetry({
    videoRef,
    channel,
    retryCount,
    lastRetryTime,
    setRetryCount,
    setLastRetryTime,
    setIsLoading,
    setError,
    setIsPlaying
  });
  
  // استخدام مرفق إعادة المحاولة التلقائية
  const { handlePlaybackError } = useAutoRetry({
    videoRef,
    channel,
    retryCount,
    maxRetries,
    setRetryCount,
    setIsLoading,
    setError
  });

  return {
    retryCount,
    retryPlayback,
    handlePlaybackError
  };
}
