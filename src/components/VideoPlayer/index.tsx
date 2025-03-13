
import React, { useRef, useEffect, useState } from 'react';
import { Channel } from '@/types';
import { useVideoPlayer } from '@/hooks/videoPlayer';
import VideoHeader from './VideoHeader';
import VideoControls from './VideoControls';
import VideoError from './VideoError';
import VideoLoading from './VideoLoading';
import TVControls from './TVControls';
import InspectProtection from './InspectProtection';
import { toast } from "@/hooks/use-toast";
import { VIDEO_PLAYER } from '@/services/config';
import { useDeviceType } from '@/hooks/use-tv';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isTV } = useDeviceType();
  
  // Secure channel data for display
  const secureChannel = React.useMemo(() => {
    return {
      ...channel,
      _displayUrl: VIDEO_PLAYER.HIDE_STREAM_URLS ? '[محمي]' : channel.streamUrl
    };
  }, [channel]);
  
  // Initialize video player
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

  // Handle TV focus
  useEffect(() => {
    if (isTV && playerContainerRef.current) {
      playerContainerRef.current.setAttribute('tabindex', '0');
      playerContainerRef.current.focus();
      
      handleMouseMove();
    }
  }, [isTV, handleMouseMove]);

  // Log player state & show toast on initialization
  useEffect(() => {
    if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
      console.log("VideoPlayer state:", { 
        isLoading, 
        error, 
        retryCount, 
        channelName: channel.name,
        streamUrl: '[محمي]'
      });
    } else {
      console.log("VideoPlayer state:", { 
        isLoading, 
        error, 
        retryCount, 
        channelName: channel.name,
        streamUrl: channel.streamUrl
      });
    }
    
    if (!isInitialized && channel.streamUrl) {
      setIsInitialized(true);
      
      toast({
        title: `جاري تشغيل ${channel.name}`,
        description: "يرجى الانتظار قليلاً...",
        duration: 3000,
      });
    }
  }, [isLoading, error, retryCount, channel, isInitialized]);

  // Event handlers for UI components
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleVolumeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVolumeChange(parseFloat(e.target.value));
  };

  const handleFullscreenToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen(playerContainerRef);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    retryPlayback();
    
    toast({
      title: "إعادة المحاولة",
      description: "جاري إعادة تحميل البث...",
      duration: 2000,
    });
  };

  const handleSeek = (seconds: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    seekVideo(seconds);
  };

  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlayPause();
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation();
    retryPlayback();
    
    toast({
      title: "إعادة تحميل",
      description: "جاري إعادة تحميل البث...",
      duration: 2000,
    });
  };

  // Secure error display function
  const secureErrorDisplay = React.useCallback((errorMsg: string | null) => {
    if (!errorMsg) return null;
    
    return errorMsg.replace(/(https?:\/\/[^\s]+)/g, '[محمي]');
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col" 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onClick={togglePlayPause}
    >
      {/* Security feature to disable browser inspect */}
      <InspectProtection />
      
      {/* Channel info header */}
      <VideoHeader 
        channel={secureChannel} 
        onClose={handleClose} 
        show={showControls} 
      />
      
      <div className="flex-1 flex items-center justify-center relative">
        {isLoading && <VideoLoading retryCount={retryCount} />}
        
        {error && (
          <VideoError 
            error={secureErrorDisplay(error)} 
            onRetry={handleRetry} 
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
          onPlayPause={handlePlayPauseClick}
          onMuteToggle={handleMuteToggle}
          onFullscreenToggle={handleFullscreenToggle}
          onVolumeChange={handleVolumeInputChange}
          onSeek={handleSeek}
          onClick={handleBackdropClick}
          onReload={handleReload}
          isTV={isTV}
        />
      </div>
      
      {/* TV-specific controls and hints */}
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
