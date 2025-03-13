
import React, { useRef, useEffect, useState } from 'react';
import { Channel } from '@/types';
import { useVideoPlayer } from '@/hooks/videoPlayer';
import VideoHeader from './VideoHeader';
import VideoControls from './VideoControls';
import VideoError from './VideoError';
import VideoLoading from './VideoLoading';
import TVControls from './TVControls';
import InspectProtection from './InspectProtection';
import { usePlayerEventHandlers } from './PlayerEventHandlers';
import { toast } from "@/hooks/use-toast";
import { VIDEO_PLAYER } from '@/services/config';
import { useDeviceType } from '@/hooks/use-tv';
import { playChannel } from '@/services/channelService';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isTV } = useDeviceType();
  
  // بيانات القناة
  const secureChannel = React.useMemo(() => {
    return {
      ...channel,
      _displayUrl: VIDEO_PLAYER.HIDE_STREAM_URLS ? '[محمي]' : channel.streamUrl
    };
  }, [channel]);
  
  // تهيئة مشغل الفيديو
  const {
    videoRef,
    isFullscreen,
    isMuted,
    isPlaying,
    isLoading,
    showControls,
    currentVolume,
    error,
    retryCount,
    handleMouseMove,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    retryPlayback,
    seekVideo
  } = useVideoPlayer({ channel: secureChannel });

  // معالجات الأحداث
  const eventHandlers = usePlayerEventHandlers({
    onClose,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    seekVideo,
    retryPlayback
  });

  // تحسينات واجهة المستخدم لأجهزة التلفزيون
  useEffect(() => {
    if (isTV && playerContainerRef.current) {
      // تعيين التركيز للحاوية
      playerContainerRef.current.setAttribute('tabindex', '0');
      playerContainerRef.current.focus();
      
      // إظهار عناصر التحكم عند بدء التشغيل
      handleMouseMove();
      
      // تعديل حجم المشغل للتلفزيون
      document.body.classList.add('tv-mode');
      
      // تعطيل التمرير في الصفحة عند تشغيل الفيديو
      document.body.style.overflow = 'hidden';
      
      // زيادة حجم مشغل الفيديو لتلفزيونات Smart TV
      if (playerContainerRef.current) {
        playerContainerRef.current.style.fontSize = '1.2rem';
      }
    }
    
    return () => {
      document.body.classList.remove('tv-mode');
      document.body.style.overflow = '';
    };
  }, [isTV, handleMouseMove]);

  // تسجيل المشاهدة
  useEffect(() => {
    if (!isInitialized && channel.streamUrl) {
      setIsInitialized(true);
      playChannel(channel.id).catch(console.error);
      
      toast({
        title: `جاري تشغيل ${channel.name}`,
        description: isTV ? "استخدم أزرار التنقل للتحكم" : "يرجى الانتظار قليلاً...",
        duration: 3000,
      });
    }
  }, [isInitialized, channel, isTV]);

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex flex-col ${isTV ? 'tv-player' : ''}`} 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onClick={togglePlayPause}
      tabIndex={0}
    >
      <InspectProtection />
      
      <VideoHeader 
        channel={secureChannel} 
        onClose={eventHandlers.handleClose} 
        show={showControls} 
      />
      
      <div className="flex-1 flex items-center justify-center relative">
        {isLoading && <VideoLoading retryCount={retryCount} />}
        
        {error && (
          <VideoError 
            error={error} 
            onRetry={eventHandlers.handleRetry} 
            streamUrl={VIDEO_PLAYER.HIDE_STREAM_URLS ? '[محمي]' : channel.streamUrl}
          />
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={false}
          playsInline
        />
        
        <VideoControls 
          show={showControls && !isLoading && !error}
          isPlaying={isPlaying}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          currentVolume={currentVolume}
          onPlayPause={eventHandlers.handlePlayPauseClick}
          onMuteToggle={eventHandlers.handleMuteToggle}
          onFullscreenToggle={eventHandlers.handleFullscreenToggle}
          onVolumeChange={eventHandlers.handleVolumeInputChange}
          onSeek={eventHandlers.handleSeek}
          onClick={eventHandlers.handleBackdropClick}
          onReload={eventHandlers.handleReload}
          isTV={isTV}
          channel={channel} // تمرير القناة لدعم الخدمات الخارجية
        />
      </div>
      
      <TVControls 
        isTV={isTV}
        isInitialized={isInitialized}
        isLoading={isLoading}
        onClose={onClose}
        togglePlayPause={togglePlayPause}
        seekVideo={seekVideo}
        toggleMute={toggleMute}
        toggleFullscreen={toggleFullscreen}
        playerContainerRef={playerContainerRef}
      />
    </div>
  );
};

export default VideoPlayer;
