
/**
 * مكون مشغل الفيديو مع معالجة متقدمة للأخطاء
 */

import React, { useCallback } from 'react';
import { Channel } from '@/types';
import { useVideoPlayback } from '@/hooks/videoPlayer/useVideoPlayback';
import { useVideoErrorHandling } from '@/hooks/videoPlayer/useVideoErrorHandling';
import VideoPlayer from './VideoPlayer';
import VideoError from './VideoError';
import VideoControls from './VideoControls';
import VideoSpinner from './VideoSpinner';

interface VideoPlayerWithErrorHandlingProps {
  channel: Channel;
  onClose?: () => void;
}

const VideoPlayerWithErrorHandling: React.FC<VideoPlayerWithErrorHandlingProps> = ({
  channel,
  onClose
}) => {
  // مرفق تشغيل الفيديو الأساسي
  const {
    videoRef,
    isPlaying,
    isLoading,
    error: playbackError,
    togglePlayPause,
    retryPlayback: baseRetryPlayback,
    seekVideo
  } = useVideoPlayback({ channel });

  // دالة إعادة المحاولة المخصصة لتمريرها إلى مرفق معالجة الأخطاء
  const retryPlayback = useCallback(async () => {
    if (baseRetryPlayback) {
      await baseRetryPlayback();
    }
  }, [baseRetryPlayback]);

  // مرفق معالجة أخطاء الفيديو المتقدم
  const {
    errorState,
    handlePlaybackError,
    clearError,
    retryAfterError
  } = useVideoErrorHandling(retryPlayback, 3);

  // معالجة إعادة المحاولة اليدوية
  const handleRetry = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // محاولة إعادة التشغيل باستخدام مرفق معالجة الأخطاء
    await retryAfterError();
  };

  // معالجة أخطاء التشغيل (من دالة تهيئة الفيديو)
  React.useEffect(() => {
    if (playbackError) {
      handlePlaybackError(playbackError);
    } else if (!playbackError && errorState.hasError) {
      clearError();
    }
  }, [playbackError, handlePlaybackError, errorState.hasError, clearError]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* مشغل الفيديو الأساسي */}
      <VideoPlayer 
        channel={channel} 
        videoRef={videoRef}
      />
      
      {/* عرض مؤشر التحميل إذا كان التحميل نشطًا */}
      {isLoading && !errorState.hasError && (
        <VideoSpinner />
      )}
      
      {/* عرض أدوات التحكم إذا لم يكن هناك خطأ */}
      {!errorState.hasError && (
        <VideoControls 
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onClose={onClose}
          onSeek={seekVideo}
          channel={channel}
        />
      )}
      
      {/* عرض شاشة الخطأ إذا كان هناك خطأ */}
      {errorState.hasError && (
        <VideoError 
          error={errorState.errorMessage || 'خطأ غير معروف في تشغيل الفيديو'} 
          onRetry={handleRetry} 
          streamUrl={channel.streamUrl}
          errorCode={errorState.errorCode}
          isRecoverable={errorState.isRecoverable}
          attempts={errorState.attempts}
        />
      )}
    </div>
  );
};

export default VideoPlayerWithErrorHandling;
