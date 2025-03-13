
import React, { useState, useEffect } from 'react';
import { Channel } from '@/types';
import VideoHeader from './VideoHeader';
import VideoControls from './VideoControls';
import VideoContent from './VideoContent';
import TVControls from './TVControls';
import InspectProtection from './InspectProtection';
import { useVideo } from '@/hooks/videoPlayer/useVideo';
import { usePlayerEventHandlers } from './PlayerEventHandlers';
import { toast } from "@/hooks/use-toast";
import { useDeviceType } from '@/hooks/use-tv';
import { playChannel } from '@/services/channelService';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const playerContainerRef = React.useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showStreamSources, setShowStreamSources] = useState(false);
  const [showProgramGuide, setShowProgramGuide] = useState(false);
  const { isTV } = useDeviceType();
  
  // استخدام هوك الفيديو
  const {
    videoRef,
    secureChannel,
    isPlaying,
    isLoading,
    isMuted,
    isFullscreen,
    currentVolume,
    showControls,
    error,
    retryCount,
    currentStreamUrl,
    handleMouseMove,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    retryPlayback,
    seekVideo,
    handleChangeStreamSource
  } = useVideo({ 
    channel,
    initialStreamUrl: channel.streamUrl
  });

  // إعداد معالجات الأحداث
  const eventHandlers = usePlayerEventHandlers({
    onClose,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    seekVideo,
    retryPlayback
  });

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
      
      <VideoContent 
        videoRef={videoRef}
        isLoading={isLoading}
        error={error}
        retryCount={retryCount}
        retryPlayback={retryPlayback}
        channel={channel}
        currentStreamUrl={currentStreamUrl}
        showStreamSources={showStreamSources}
        showProgramGuide={showProgramGuide}
        setShowStreamSources={setShowStreamSources}
        setShowProgramGuide={setShowProgramGuide}
        handleChangeStreamSource={handleChangeStreamSource}
        showControls={showControls}
        handleMouseMove={handleMouseMove}
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
        onVolumeChange={handleVolumeChange}
        onSeek={eventHandlers.handleSeek}
        onClick={eventHandlers.handleBackdropClick}
        onReload={eventHandlers.handleReload}
        isTV={isTV}
        channel={channel}
        onShowStreamSources={() => setShowStreamSources(true)}
        onShowProgramGuide={() => setShowProgramGuide(true)}
      />
      
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
