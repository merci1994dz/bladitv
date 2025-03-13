
import React, { useEffect } from 'react';

interface TVControlsProps {
  isTV: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  onClose: () => void;
  togglePlayPause: () => void;
  seekVideo: (seconds: number) => void;
  toggleMute: () => void;
  toggleFullscreen: (ref: React.RefObject<HTMLDivElement>) => void;
  playerContainerRef: React.RefObject<HTMLDivElement>;
}

const TVControls: React.FC<TVControlsProps> = ({
  isTV,
  isInitialized,
  isLoading,
  onClose,
  togglePlayPause,
  seekVideo,
  toggleMute,
  toggleFullscreen,
  playerContainerRef
}) => {
  // TV-specific keyboard event handling
  useEffect(() => {
    if (!isTV) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Common TV remote control buttons
      switch (e.key) {
        case ' ':
        case 'Enter':
          togglePlayPause();
          e.preventDefault();
          break;
        case 'ArrowLeft':
          seekVideo(-10);
          e.preventDefault();
          break;
        case 'ArrowRight':
          seekVideo(10);
          e.preventDefault();
          break;
        case 'Escape':
          onClose();
          e.preventDefault();
          break;
        case 'm':
          toggleMute();
          e.preventDefault();
          break;
        case 'f':
          toggleFullscreen(playerContainerRef);
          e.preventDefault();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTV, togglePlayPause, seekVideo, onClose, toggleMute, toggleFullscreen, playerContainerRef]);

  // TV-specific helper message (only shows briefly on channel change)
  if (!isTV || !isInitialized) return null;

  return (
    <div className={`absolute top-20 left-0 right-0 flex justify-center transition-opacity duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
        <p>استخدم مفاتيح التنقل في جهاز التحكم للتحكم في المشغل</p>
      </div>
    </div>
  );
};

export default TVControls;
