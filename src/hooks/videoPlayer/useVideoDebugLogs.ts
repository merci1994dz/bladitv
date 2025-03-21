
import { useEffect, useRef } from 'react';
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
  // إنشاء مرجع لتتبع آخر حالة
  const lastStateRef = useRef<Omit<UseVideoDebugLogsProps, 'channel'>>({
    isMobile,
    isPlaying,
    isLoading,
    isVideoReady,
    error,
    retryCount,
    connectionAttempts
  });
  
  // تسجيل معلومات التصحيح
  useEffect(() => {
    const lastState = lastStateRef.current;
    const stateChanged = 
      lastState.isPlaying !== isPlaying ||
      lastState.isLoading !== isLoading ||
      lastState.isVideoReady !== isVideoReady ||
      lastState.error !== error ||
      lastState.retryCount !== retryCount ||
      lastState.connectionAttempts !== connectionAttempts;
    
    // تقليل كثافة التسجيل للمعلومات الشائعة - سجل فقط عند تغيير الحالة
    if (stateChanged && (error || retryCount > 0 || (!isLoading && !isPlaying) || connectionAttempts > 0)) {
      console.log("معلومات الفيديو:", {
        name: channel?.name || 'لا يوجد',
        streamUrl: channel?.streamUrl ? channel.streamUrl.substring(0, 30) + "..." : "مفقود",
        isMobile,
        isPlaying,
        isLoading,
        isVideoReady,
        retryCount,
        connectionAttempts,
        error: error || "لا يوجد خطأ",
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent
      });
      
      // تحديث الحالة المرجعية
      lastStateRef.current = {
        isMobile,
        isPlaying,
        isLoading,
        isVideoReady,
        error,
        retryCount,
        connectionAttempts
      };
    }
  }, [channel, isMobile, isPlaying, isLoading, isVideoReady, error, retryCount, connectionAttempts]);
  
  // تسجيل معلومات التصحيح عند تهيئة القناة
  useEffect(() => {
    if (channel) {
      console.log("تم تحميل القناة:", {
        id: channel.id,
        name: channel.name,
        streamUrl: channel.streamUrl ? channel.streamUrl.substring(0, 30) + "..." : "غير متوفر",
        category: channel.category || "غير معروف", // تصحيح: استخدام category كسلسلة نصية مباشرة
        timestamp: new Date().toISOString()
      });
    }
  }, [channel]);
}
