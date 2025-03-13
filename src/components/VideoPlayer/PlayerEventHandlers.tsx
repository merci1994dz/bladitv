
import React from 'react';

interface PlayerEventHandlersProps {
  onClose: () => void;
  togglePlayPause: () => void;
  toggleFullscreen: (ref: React.RefObject<HTMLDivElement>) => void;
  toggleMute: () => void;
  handleVolumeChange: (volume: number) => void;
  seekVideo: (seconds: number) => void;
  retryPlayback: () => void;
  children: React.ReactNode;
}

const PlayerEventHandlers: React.FC<PlayerEventHandlersProps> = ({ 
  children,
  onClose,
  togglePlayPause,
  toggleFullscreen,
  toggleMute,
  handleVolumeChange,
  seekVideo,
  retryPlayback
}) => {
  // Handler functions wrapped to prevent event propagation
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleVolumeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVolumeChange(parseFloat(e.target.value));
  };

  const handleFullscreenToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen(null); // Will be overridden in the parent component
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

  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation();
    retryPlayback();
  };

  return {
    handleClose,
    handleVolumeInputChange,
    handleFullscreenToggle,
    handleRetry,
    handleSeek,
    handlePlayPauseClick,
    handleMuteToggle,
    handleBackdropClick,
    handleReload
  };
};

export default PlayerEventHandlers;
