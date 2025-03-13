
import { useRef } from 'react';
import { Channel } from '@/types';
import { useVideoPlayback } from './useVideoPlayback';
import { useVideoControls } from './useVideoControls';
import { useVideoVolume } from './useVideoVolume';
import { useVideoFullscreen } from './useVideoFullscreen';

interface UseVideoPlayerProps {
  channel: Channel;
}

export function useVideoPlayer({ channel }: UseVideoPlayerProps) {
  // Set up the player container ref
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Combine the different hooks
  const {
    isPlaying,
    isLoading,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  } = useVideoPlayback({ channel });
  
  const {
    showControls,
    handleMouseMove
  } = useVideoControls(isPlaying);
  
  const {
    isMuted,
    currentVolume,
    toggleMute: toggleMuteBase,
    handleVolumeChange: handleVolumeChangeBase,
    initializeVolume
  } = useVideoVolume();
  
  const {
    isFullscreen,
    toggleFullscreen
  } = useVideoFullscreen();
  
  // Initialize volume on first render and when channel changes
  initializeVolume(videoRef);
  
  // Wrap the volume methods to simplify their usage
  const toggleMute = () => toggleMuteBase(videoRef);
  const handleVolumeChange = (newVolume: number) => handleVolumeChangeBase(videoRef, newVolume);

  return {
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
  };
}
