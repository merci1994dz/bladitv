
import { useEffect } from 'react';
import { Channel } from '@/types';

interface UseVideoDebugLogsProps {
  channel: Channel;
  isMobile: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isVideoReady: boolean;
  error: string | null;
  retryCount: number;
  connectionAttempts: number;
}

export function useVideoDebugLogs({
  channel,
  isMobile,
  isPlaying,
  isLoading,
  isVideoReady,
  error,
  retryCount,
  connectionAttempts
}: UseVideoDebugLogsProps) {
  
  // Log debug information
  useEffect(() => {
    // Reduce logging intensity for common information
    if (error || retryCount > 0 || (!isLoading && !isPlaying)) {
      console.log("معلومات الفيديو:", {
        name: channel?.name || 'لا يوجد',
        streamUrl: channel?.streamUrl ? "موجود" : "مفقود",
        isMobile,
        isPlaying,
        isLoading,
        isVideoReady,
        retryCount,
        connectionAttempts,
        error: error || "لا يوجد خطأ"
      });
    }
  }, [channel, isMobile, isPlaying, isLoading, isVideoReady, error, retryCount, connectionAttempts]);
}
