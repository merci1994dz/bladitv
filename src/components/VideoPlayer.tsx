
import React, { useRef, useEffect, useState } from 'react';
import { Channel } from '@/types';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Maximize, Minimize, X, RotateCcw, Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize video player
  useEffect(() => {
    if (videoRef.current) {
      // Reset states on new video
      setError(null);
      setIsLoading(true);
      setRetryCount(0);
      
      // Setup video element
      const video = videoRef.current;
      video.muted = isMuted;
      
      // Add event listeners
      const handleCanPlay = () => {
        console.log('Video can play');
        setIsLoading(false);
      };
      
      const handlePlaying = () => {
        console.log('Video is playing');
        setIsPlaying(true);
        setIsLoading(false);
        setError(null);
      };
      
      const handleError = () => {
        console.error('Video error:', video.error);
        if (retryCount < maxRetries) {
          console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            video.load();
            video.play().catch(e => console.error('Retry play failed:', e));
          }, 1000);
        } else {
          setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
          setIsLoading(false);
          setIsPlaying(false);
        }
      };
      
      const handleStalled = () => {
        console.log('Video stalled');
        setIsLoading(true);
      };
      
      const handleWaiting = () => {
        console.log('Video waiting');
        setIsLoading(true);
      };
      
      // Register all event listeners
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      video.addEventListener('stalled', handleStalled);
      video.addEventListener('waiting', handleWaiting);
      
      // Set source and play
      video.src = channel.streamUrl;
      
      // Attempt to play
      video.load();
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Initial play successful');
          })
          .catch(err => {
            console.error('Error on initial play:', err);
            // Don't set error immediately, let the error event handler manage retries
            setIsLoading(true);
          });
      }
      
      // Cleanup function
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
        video.removeEventListener('stalled', handleStalled);
        video.removeEventListener('waiting', handleWaiting);
        video.pause();
        video.src = '';
        video.load();
        
        // Exit fullscreen on unmount if needed
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(e => console.error('Error exiting fullscreen:', e));
        }
      };
    }
  }, [channel.streamUrl, isMuted, retryCount]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
          });
      }
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Retry playing after error
  const retryPlayback = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error playing video on retry:', err);
            setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
            setIsLoading(false);
          });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" ref={playerContainerRef}>
      {/* Header controls */}
      <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-10 h-10 object-contain bg-black/20 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
            }}
          />
          <h2 className="text-white text-xl font-bold">{channel.name}</h2>
        </div>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-red-500/20" 
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Video player */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-4">
            <p className="text-white text-lg mb-4">{error}</p>
            <Button onClick={retryPlayback} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              إعادة المحاولة
            </Button>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={false}
          playsInline
        />
        
        {/* Center play/pause button (visible on tap) */}
        {!isLoading && !error && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            onClick={togglePlayPause}
          >
            <div className="bg-black/40 rounded-full p-4">
              {isPlaying ? 
                <Pause className="w-12 h-12 text-white" /> : 
                <Play className="w-12 h-12 text-white" />
              }
            </div>
          </div>
        )}
      </div>
      
      {/* Footer controls */}
      <div className="p-4 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-10">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20" 
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
        
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20" 
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20" 
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoPlayer;
