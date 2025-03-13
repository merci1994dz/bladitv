
import React, { useRef } from 'react';
import { Channel } from '@/types';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import VideoHeader from './VideoHeader';
import VideoControls from './VideoControls';
import VideoError from './VideoError';
import VideoLoading from './VideoLoading';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    videoRef,
    isFullscreen,
    isMuted,
    isPlaying,
    isLoading,
    showControls,
    currentVolume,
    error,
    handleMouseMove,
    togglePlayPause,
    toggleFullscreen,
    toggleMute,
    handleVolumeChange,
    retryPlayback,
    seekVideo
  } = useVideoPlayer({ channel });

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
        {isLoading && <VideoLoading />}
        
        {error && (
          <VideoError error={error} onRetry={handleRetry} />
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
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
