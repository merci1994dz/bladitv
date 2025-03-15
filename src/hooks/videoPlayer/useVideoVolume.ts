
import { useState, useRef, useEffect } from 'react';
import { VideoRef } from './useVideoSetup';

export function useVideoVolume() {
  const [isMuted, setIsMuted] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(1);
  
  // Toggle mute
  const toggleMute = (videoRef?: React.RefObject<HTMLVideoElement>) => {
    if (videoRef?.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting, restore to previous volume
      if (!newMutedState && videoRef.current.volume === 0) {
        videoRef.current.volume = currentVolume || 0.5;
      }
    } else {
      setIsMuted(!isMuted);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (videoRef: React.RefObject<HTMLVideoElement>, newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setCurrentVolume(newVolume);
      
      // If volume is 0, mute; otherwise ensure it's unmuted
      if (newVolume === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    } else {
      setCurrentVolume(newVolume);
    }
  };

  // Initialize player with volume settings
  const initializeVolume = (videoRef: React.RefObject<HTMLVideoElement>) => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
    videoRef.current.volume = currentVolume;
  };
  
  // Volume increase/decrease functions
  const increaseVolume = (videoRef?: React.RefObject<HTMLVideoElement>) => {
    const newVolume = Math.min(1, currentVolume + 0.1);
    if (videoRef) {
      handleVolumeChange(videoRef, newVolume);
    } else {
      setCurrentVolume(newVolume);
      setIsMuted(false);
    }
  };
  
  const decreaseVolume = (videoRef?: React.RefObject<HTMLVideoElement>) => {
    const newVolume = Math.max(0, currentVolume - 0.1);
    if (videoRef) {
      handleVolumeChange(videoRef, newVolume);
    } else {
      setCurrentVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      }
    }
  };
  
  return {
    isMuted,
    currentVolume,
    toggleMute,
    handleVolumeChange,
    initializeVolume,
    increaseVolume,
    decreaseVolume
  };
}
