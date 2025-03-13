
import { Channel } from '@/types';
import { useVideoPlayback } from './useVideoPlayback';
import { useVideoControls } from './useVideoControls';
import { useVideoVolume } from './useVideoVolume';
import { useVideoFullscreen } from './useVideoFullscreen';
import { useEffect, useRef } from 'react';

interface UseVideoPlayerProps {
  channel: Channel;
}

export function useVideoPlayer({ channel }: UseVideoPlayerProps) {
  // Reference to track if the volume was initialized
  const volumeInitializedRef = useRef(false);
  // Reference to track the current channel ID
  const currentChannelIdRef = useRef(channel.id);
  
  // Get video playback functionality
  const {
    videoRef,
    isPlaying,
    isLoading,
    error,
    retryCount,
    togglePlayPause,
    retryPlayback,
    seekVideo
  } = useVideoPlayback({ channel });
  
  // Get controls visibility
  const {
    showControls,
    handleMouseMove
  } = useVideoControls(isPlaying);
  
  // Get volume control
  const {
    isMuted,
    currentVolume,
    toggleMute: toggleMuteBase,
    handleVolumeChange: handleVolumeChangeBase,
    initializeVolume
  } = useVideoVolume();
  
  // Get fullscreen control
  const {
    isFullscreen,
    toggleFullscreen
  } = useVideoFullscreen();
  
  // Initialize volume only once when video ref is available
  useEffect(() => {
    if (videoRef.current && !volumeInitializedRef.current) {
      initializeVolume(videoRef);
      volumeInitializedRef.current = true;
    }
  }, [videoRef, initializeVolume]);
  
  // Re-initialize volume and track channel changes
  useEffect(() => {
    if (videoRef.current) {
      // Check if the channel has changed
      if (currentChannelIdRef.current !== channel.id) {
        currentChannelIdRef.current = channel.id;
        console.log(`Channel changed to: ${channel.name} (${channel.id})`);
      }
      
      // Initialize volume for the current channel
      initializeVolume(videoRef);
    }
  }, [channel.id, initializeVolume, videoRef, channel.name]);
  
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
