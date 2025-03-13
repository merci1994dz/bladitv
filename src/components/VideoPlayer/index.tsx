
import React, { useRef, useEffect, useState } from 'react';
import { Channel } from '@/types';
import { useVideoPlayer } from '@/hooks/videoPlayer';
import VideoHeader from './VideoHeader';
import VideoControls from './VideoControls';
import VideoError from './VideoError';
import VideoLoading from './VideoLoading';
import { toast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
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
  } = useVideoPlayer({ channel });

  // Log state values for debugging
  useEffect(() => {
    console.log("VideoPlayer state:", { 
      isLoading, 
      error, 
      retryCount, 
      channelName: channel.name,
      streamUrl: channel.streamUrl
    });
    
    if (!isInitialized && channel.streamUrl) {
      setIsInitialized(true);
      
      // Notify user that channel is loading
      toast({
        title: `جاري تشغيل ${channel.name}`,
        description: "يرجى الانتظار قليلاً...",
        duration: 3000,
      });
    }
  }, [isLoading, error, retryCount, channel, isInitialized]);

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

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col" 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onClick={togglePlayPause}
    >
      <VideoHeader 
        channel={channel} 
        onClose={handleClose} 
        show={showControls} 
      />
      
      <div className="flex-1 flex items-center justify-center relative">
        {isLoading && <VideoLoading retryCount={retryCount} />}
        
        {error && (
          <VideoError 
            error={error} 
            onRetry={handleRetry} 
            streamUrl={channel.streamUrl}
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
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
