
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

// تحسين: تحويل هذا إلى hook لإدارة أفضل للأحداث
export function usePlayerEventHandlers({ 
  onClose,
  togglePlayPause,
  toggleFullscreen,
  toggleMute,
  handleVolumeChange,
  seekVideo,
  retryPlayback
}: Omit<PlayerEventHandlersProps, 'children'>) {
  // تغليف دوال المعالجة لمنع انتشار الأحداث
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleVolumeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVolumeChange(parseFloat(e.target.value));
  };

  const handleFullscreenToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen(null); // سيتم تجاوزه في المكون الأب
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    // تحسين: إضافة سجل للمحاولات الفاشلة
    console.log('Retrying playback after failure');
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
    console.log('Manual reload requested by user');
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
}

// الاحتفاظ بمكون التغليف للتوافق الخلفي
const PlayerEventHandlers: React.FC<PlayerEventHandlersProps> = (props) => {
  // فقط عرض العناصر الابن - سيتم استخدام المعالجات الفعلية عبر الهوك
  return <>{props.children}</>;
};

export default PlayerEventHandlers;
