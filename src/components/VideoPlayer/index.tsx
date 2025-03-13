import React, { useRef, useEffect, useState } from 'react';
import { Channel } from '@/types';
import { useVideoPlayer } from '@/hooks/videoPlayer';
import VideoHeader from './VideoHeader';
import VideoControls from './VideoControls';
import VideoError from './VideoError';
import VideoLoading from './VideoLoading';
import { toast } from "@/hooks/use-toast";
import { VIDEO_PLAYER } from '@/services/config';
import { useDeviceType } from '@/hooks/use-tv';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isTV } = useDeviceType();
  
  const secureChannel = React.useMemo(() => {
    return {
      ...channel,
      _displayUrl: VIDEO_PLAYER.HIDE_STREAM_URLS ? '[محمي]' : channel.streamUrl
    };
  }, [channel]);
  
  const {
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
  } = useVideoPlayer({ channel: secureChannel });

  useEffect(() => {
    if (isTV && playerContainerRef.current) {
      playerContainerRef.current.setAttribute('tabindex', '0');
      playerContainerRef.current.focus();
      
      handleMouseMove();
    }
  }, [isTV, handleMouseMove]);

  useEffect(() => {
    if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
      console.log("VideoPlayer state:", { 
        isLoading, 
        error, 
        retryCount, 
        channelName: channel.name,
        streamUrl: '[محمي]'
      });
    } else {
      console.log("VideoPlayer state:", { 
        isLoading, 
        error, 
        retryCount, 
        channelName: channel.name,
        streamUrl: channel.streamUrl
      });
    }
    
    if (!isInitialized && channel.streamUrl) {
      setIsInitialized(true);
      
      toast({
        title: `جاري تشغيل ${channel.name}`,
        description: "يرجى الانتظار قليلاً...",
        duration: 3000,
      });
    }
  }, [isLoading, error, retryCount, channel, isInitialized]);

  useEffect(() => {
    if (VIDEO_PLAYER.DISABLE_INSPECT) {
      const disableDevTools = () => {
        document.addEventListener('keydown', (e) => {
          if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) || 
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
          ) {
            e.preventDefault();
          }
        });
      };
      
      disableDevTools();
    }
  }, []);

  useEffect(() => {
    if (!isTV) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isTV, togglePlayPause, seekVideo, onClose, toggleMute, toggleFullscreen]);

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
    
    toast({
      title: "إعادة المحاولة",
      description: "جاري إعادة تحميل البث...",
      duration: 2000,
    });
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
    
    toast({
      title: "إعادة تحميل",
      description: "جاري إعادة تحميل البث...",
      duration: 2000,
    });
  };

  const secureErrorDisplay = React.useCallback((errorMsg: string | null) => {
    if (!errorMsg) return null;
    
    return errorMsg.replace(/(https?:\/\/[^\s]+)/g, '[محمي]');
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col" 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onClick={togglePlayPause}
    >
      <VideoHeader 
        channel={secureChannel} 
        onClose={handleClose} 
        show={showControls} 
      />
      
      <div className="flex-1 flex items-center justify-center relative">
        {isLoading && <VideoLoading retryCount={retryCount} />}
        
        {error && (
          <VideoError 
            error={secureErrorDisplay(error)} 
            onRetry={handleRetry} 
            streamUrl={VIDEO_PLAYER.HIDE_STREAM_URLS ? '[محمي]' : channel.streamUrl}
          />
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
          onReload={handleReload}
          isTV={isTV}
        />
      </div>
      
      {isTV && isInitialized && (
        <div className={`absolute top-20 left-0 right-0 flex justify-center transition-opacity duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
            <p>استخدم مفاتيح التنقل في جهاز التحكم للتحكم في المشغل</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
