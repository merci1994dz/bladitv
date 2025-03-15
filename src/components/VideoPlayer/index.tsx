
import React, { useEffect, useRef } from 'react';
import { Channel } from '@/types';
import { useVideoPlayback } from '@/hooks/videoPlayer/useVideoPlayback';
import { useDeviceType } from '@/hooks/use-tv';
import { useVideo } from '@/hooks/videoPlayer/useVideo';

import VideoHeader from './VideoHeader';
import TVControls from './TVControls';
import VideoContent from './VideoContent';
import VideoControls from './VideoControls';
import InspectProtection from './InspectProtection';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const { isTV } = useDeviceType();
  const [showStreamSources, setShowStreamSources] = React.useState(false);
  const [showProgramGuide, setShowProgramGuide] = React.useState(false);
  const [currentStreamUrl, setCurrentStreamUrl] = React.useState(channel.streamUrl);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    videoRef,
    isLoading,
    error,
    isPlaying,
    isMuted,
    currentVolume,
    isFullscreen,
    showControls,
    retryCount,
    setShowControls,
    handleMouseMove,
    togglePlayPause,
    toggleMute,
    setVolume,
    toggleFullscreen,
    retryPlayback,
    seekVideo,
    cleanup
  } = useVideo(channel);

  // Update stream URL when channel changes
  useEffect(() => {
    setCurrentStreamUrl(channel.streamUrl);
  }, [channel]);

  // Handle stream source change
  const handleChangeStreamSource = (url: string) => {
    setCurrentStreamUrl(url);
    // Force video to load new source
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Handle click on video to toggle controls
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowControls(prev => !prev);
  };

  // Handle reload button
  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation();
    retryPlayback();
  };

  // Handle toggling stream sources panel
  const handleToggleStreamSources = () => {
    setShowStreamSources(prev => !prev);
    setShowProgramGuide(false);
  };

  // Handle toggling program guide panel
  const handleToggleProgramGuide = () => {
    setShowProgramGuide(prev => !prev);
    setShowStreamSources(false);
  };

  // Modified wrappers for event handlers to match expected types
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  };
  
  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  // Modify container click behavior based on streaming mode
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showStreamSources || showProgramGuide) {
      setShowStreamSources(false);
      setShowProgramGuide(false);
    }
  };

  // Handle close with correct event type
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden mb-4 z-10 shadow-lg rounded-lg"
      onClick={handleContainerClick}
    >
      <InspectProtection />
      
      <VideoHeader 
        channel={channel} 
        onClose={handleClose}
        showControls={showControls}
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
        show={showControls}
        isPlaying={isPlaying}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        currentVolume={currentVolume}
        onPlayPause={togglePlayPause}
        onMuteToggle={handleToggleMute}
        onFullscreenToggle={handleToggleFullscreen}
        onVolumeChange={setVolume}
        onClick={handleVideoClick}
        onReload={handleReload}
        isTV={isTV}
        channel={channel}
        onShowStreamSources={handleToggleStreamSources}
        onShowProgramGuide={handleToggleProgramGuide}
      />
      
      <TVControls 
        show={showControls}
        isTV={isTV}
        isInitialized={true}
        isLoading={isLoading}
        onClose={onClose}
        togglePlayPause={togglePlayPause}
        seekVideo={seekVideo}
        toggleMute={toggleMute}
        toggleFullscreen={toggleFullscreen}
        playerContainerRef={containerRef}
      />
    </div>
  );
};

export default VideoPlayer;
