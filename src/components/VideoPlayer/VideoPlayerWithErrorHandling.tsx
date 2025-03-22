
/**
 * مكون مشغل الفيديو مع معالجة متقدمة للأخطاء
 */

import React, { useCallback, useState, useEffect } from 'react';
import { Channel } from '@/types';
import { useVideoPlayback } from '@/hooks/videoPlayer/useVideoPlayback';
import { useVideoErrorHandling } from '@/hooks/videoPlayer/useVideoErrorHandling';
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

  // حالة التحكم بالفيديو
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(true);
  const [lastRetryTime, setLastRetryTime] = useState(0);

  // دالة إعادة المحاولة المخصصة مع حماية من الضغط المتكرر
  const retryPlayback = useCallback(async () => {
    const now = Date.now();
    const minRetryInterval = 2000; // على الأقل 2 ثانية بين محاولات إعادة التشغيل
    
    if (now - lastRetryTime < minRetryInterval) {
      console.log('تجاهل إعادة المحاولة المتكررة بسرعة');
      return;
    }
    
    setLastRetryTime(now);
    
    if (baseRetryPlayback) {
      await baseRetryPlayback();
    }
  }, [baseRetryPlayback, lastRetryTime]);

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
  useEffect(() => {
    if (playbackError) {
      console.log('معالجة خطأ التشغيل:', playbackError);
      handlePlaybackError(playbackError);
    } else if (!playbackError && errorState.hasError) {
      // مسح الخطأ فقط إذا تم حل المشكلة وتم تشغيل الفيديو بنجاح
      if (isPlaying) {
        clearError();
      }
    }
  }, [playbackError, handlePlaybackError, errorState.hasError, clearError, isPlaying]);

  // تكييف دالة seekVideo لتناسب بنية التوقعات لـ onSeek في VideoControls
  const handleSeek = (seconds: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    seekVideo(seconds);
  };

  // دوال التحكم الإضافية
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
    
    setCurrentVolume(value);
    
    // إلغاء كتم الصوت عند تغيير مستوى الصوت
    if (isMuted && value > 0) {
      setIsMuted(false);
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullscreenHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(!isFullscreen);
    
    const videoContainer = videoRef.current?.parentElement;
    
    if (!videoContainer) return;
    
    try {
      if (!isFullscreen) {
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen();
        } else if ((videoContainer as any).webkitRequestFullscreen) {
          (videoContainer as any).webkitRequestFullscreen();
        } else if ((videoContainer as any).msRequestFullscreen) {
          (videoContainer as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('خطأ في تبديل وضع ملء الشاشة:', error);
    }
  };

  // التبديل بين إظهار وإخفاء أدوات التحكم
  const toggleControlsVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowControls(!showControls);
  };
  
  // استمع لأحداث ملء الشاشة
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // تطبيق إعدادات الصوت المحفوظة عند تحميل الفيديو
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = currentVolume;
      videoRef.current.muted = isMuted;
    }
  }, [currentVolume, isMuted]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* مشغل الفيديو الأساسي */}
      <video 
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
      />
      
      {/* عرض مؤشر التحميل إذا كان التحميل نشطًا */}
      {isLoading && !errorState.hasError && (
        <VideoSpinner />
      )}
      
      {/* عرض أدوات التحكم إذا لم يكن هناك خطأ */}
      {!errorState.hasError && (
        <VideoControls 
          show={showControls}
          isPlaying={isPlaying}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          currentVolume={currentVolume}
          onPlayPause={togglePlayPause}
          onMuteToggle={toggleMute}
          onFullscreenToggle={toggleFullscreenHandler}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          onClick={toggleControlsVisibility}
          onReload={handleRetry}
          channel={channel}
          onClose={onClose}
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
}

export default VideoPlayerWithErrorHandling;
