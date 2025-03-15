
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TVControlsProps {
  show: boolean;
  isTV?: boolean;
  isInitialized?: boolean;
  isLoading?: boolean;
  onClose?: () => void;
  togglePlayPause?: () => void;
  seekVideo?: (seconds: number) => void;
  toggleMute?: () => void;
  toggleFullscreen?: (ref: React.RefObject<HTMLDivElement>) => void;
  playerContainerRef?: React.RefObject<HTMLDivElement>;
}

const TVControls: React.FC<TVControlsProps> = ({
  show,
  isTV = false,
  isInitialized = true,
  isLoading = false,
  onClose = () => {},
  togglePlayPause = () => {},
  seekVideo = () => {},
  toggleMute = () => {},
  toggleFullscreen = () => {},
  playerContainerRef = React.createRef()
}) => {
  const isMobile = useIsMobile();
  
  // Only set up event listeners if we're on a TV device
  useEffect(() => {
    if (!isTV || isMobile) return;
    
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
  }, [isTV, isMobile, togglePlayPause, seekVideo, onClose, toggleMute, toggleFullscreen, playerContainerRef]);

  // Don't show TV controls on mobile devices or if not requested
  if (!isTV || isMobile || !isInitialized || !show) return null;

  return (
    <div className={`absolute top-20 left-0 right-0 flex justify-center transition-opacity duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
        <p>استخدم مفاتيح التنقل في جهاز التحكم للتحكم في المشغل</p>
      </div>
    </div>
  );
};

export default TVControls;
