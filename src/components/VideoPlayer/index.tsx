
import React, { useEffect } from 'react';
import { Channel } from '@/types';
import { useVideo } from '@/hooks/videoPlayer/useVideo';
import { useDeviceType } from '@/hooks/use-tv';

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

  const {
    videoRef,
    isLoading,
    error,
    isPlaying,
    togglePlayPause,
    isMuted,
    toggleMute,
    currentVolume,
    setVolume,
    isFullscreen,
    toggleFullscreen,
    retryCount,
    retryPlayback,
    showControls,
    setShowControls,
    handleMouseMove,
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

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setVolume(value);
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

  // Modify container click behavior based on streaming mode
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showStreamSources || showProgramGuide) {
      setShowStreamSources(false);
      setShowProgramGuide(false);
    }
  };

  return (
    <div 
      className="relative w-full aspect-video bg-black overflow-hidden mb-4 z-10 shadow-lg rounded-lg"
      onClick={handleContainerClick}
    >
      <InspectProtection />
      
      <VideoHeader 
        channel={channel} 
        onClose={onClose}
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
        onMuteToggle={toggleMute}
        onFullscreenToggle={toggleFullscreen}
        onVolumeChange={handleVolumeChange}
        onClick={handleVideoClick}
        onReload={handleReload}
        isTV={isTV}
        channel={channel}
        onShowStreamSources={handleToggleStreamSources}
        onShowProgramGuide={handleToggleProgramGuide}
      />
      
      {isTV && <TVControls show={showControls} />}
    </div>
  );
};

export default VideoPlayer;
