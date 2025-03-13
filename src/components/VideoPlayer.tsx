import React, { useRef, useEffect, useState } from 'react';
import { Channel } from '@/types';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Maximize, Minimize, X, RotateCcw, Play, Pause, FastForward, Rewind, Settings } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentVolume, setCurrentVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Set new timeout to hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Initialize video player
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Reset states on new video
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    // Setup video element
    const video = videoRef.current;
    video.muted = isMuted;
    video.volume = currentVolume;
    
    // Register event listeners
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
      
      // Only increment retry count if there's a real error (not abort)
      if (retryCount < maxRetries) {
        console.log(`Auto-retrying (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          // Use a slightly different approach for retrying
          video.src = '';
          video.load();
          video.src = channel.streamUrl;
          video.load();
          
          const playPromise = video.play().catch(e => {
            console.error('Retry play failed:', e);
            
            // Check if it's a format error - this is often not recoverable
            if (e.name === "NotSupportedError") {
              setError('فشل في تشغيل البث. تنسيق الفيديو غير مدعوم.');
              setIsLoading(false);
            }
          });
        }, 1000);
      } else {
        setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
        setIsLoading(false);
        setIsPlaying(false);
        
        toast({
          title: "تنبيه",
          description: `فشل في تشغيل القناة ${channel.name}. يرجى التحقق من اتصالك بالإنترنت.`,
          variant: "destructive",
        });
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
    
    const handleEnded = () => {
      console.log('Video ended');
      setIsPlaying(false);
    };

    // Register all event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('ended', handleEnded);
    
    // Set source and play
    video.src = channel.streamUrl;
    
    // Try playing after a small delay
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Initial play successful');
            })
            .catch(err => {
              console.error('Error on initial play:', err);
              
              // Check if it's a user interaction error
              if (err.name === "NotAllowedError") {
                setIsPlaying(false);
                setIsLoading(false);
              }
              // For format errors, set the appropriate error
              else if (err.name === "NotSupportedError") {
                setError('تنسيق الفيديو غير مدعوم في متصفحك.');
                setIsLoading(false);
              }
            });
        }
      }
    }, 300);
    
    // Cleanup function
    return () => {
      // First remove all event listeners to prevent errors during cleanup
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('ended', handleEnded);
      
      // Then handle the video properly
      try {
        video.pause();
        video.src = '';
        video.load();
      } catch (e) {
        console.error('Error during video cleanup:', e);
      }
      
      // Clear any timeouts
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Exit fullscreen on unmount if needed
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.error('Error exiting fullscreen:', e));
      }
    };
  }, [channel.streamUrl, currentVolume, isMuted, retryCount, channel.name]);

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
        // Keep controls visible for a bit after entering fullscreen
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, 3000);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
        toast({
          title: "تنبيه",
          description: "تعذر تفعيل وضع ملء الشاشة.",
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      // Always show controls in windowed mode
      setShowControls(true);
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
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting, restore to previous volume
      if (!newMutedState && videoRef.current.volume === 0) {
        videoRef.current.volume = currentVolume || 0.5;
      }
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
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
    }
  };

  // Retry playing after error
  const retryPlayback = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    if (videoRef.current) {
      // Reset completely
      videoRef.current.src = '';
      videoRef.current.load();
      
      // Set new source
      videoRef.current.src = channel.streamUrl;
      videoRef.current.load();
      
      // Try to play
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

  // Rewind and fast forward (if applicable for the stream)
  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      try {
        videoRef.current.currentTime += seconds;
      } catch (error) {
        console.error('Error seeking in video:', error);
        // Many live streams don't support seeking, so just ignore the error
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col" 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onClick={() => togglePlayPause()}
    >
      {/* Gradient overlay for header and footer controls */}
      <div 
        className={`p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="relative w-10 h-10 bg-black/20 rounded overflow-hidden flex items-center justify-center">
            <img 
              src={channel.logo} 
              alt={channel.name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
              }}
            />
          </div>
          <h2 className="text-white text-xl font-bold shadow-text">{channel.name}</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full text-white hover:bg-red-500/20 h-9 w-9" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Video player */}
      <div className="flex-1 flex items-center justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-4">
            <div className="max-w-md w-full bg-gray-900/90 p-5 rounded-lg shadow-lg backdrop-blur-sm">
              <p className="text-white text-lg mb-4 text-center">
                <span className="text-red-400 block text-4xl mb-2">⚠️</span>
                {error}
              </p>
              <div className="flex justify-center">
                <Button onClick={(e) => {
                  e.stopPropagation();
                  retryPlayback();
                }} className="bg-primary hover:bg-primary/90 gap-2">
                  <RotateCcw className="w-4 h-4" />
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={false}
          playsInline
        />
        
        {/* Center play/pause button (visible on tap or hover) */}
        <div 
          className={`absolute inset-0 flex items-center justify-center z-10 cursor-pointer pointer-events-none transition-opacity duration-300 ${showControls && !isLoading && !error ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="bg-black/40 rounded-full p-5 backdrop-blur-sm">
            {isPlaying ? 
              <Pause className="w-14 h-14 text-white" /> : 
              <Play className="w-14 h-14 text-white" />
            }
          </div>
        </div>
      </div>
      
      {/* Footer controls */}
      <div className={`p-4 flex flex-col justify-end items-stretch bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress indicator - If this is a VOD, not a live stream (placeholder for future functionality) */}
        {/* <div className="w-full bg-gray-600/30 h-1 rounded-full mb-4 hidden">
          <div className="bg-primary h-full rounded-full w-1/2"></div>
        </div> */}
        
        {/* Control buttons */}
        <div className="flex justify-between items-center">
          {/* Left controls: volume */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-10 w-10" 
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            {/* Volume slider */}
            <div 
              className="w-20 hidden md:block" 
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : currentVolume}
                onChange={handleVolumeChange}
                className="slider-thumb w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 focus:outline-none"
              />
            </div>
          </div>
          
          {/* Center controls: rewind, play, fast-forward */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex" 
              onClick={(e) => {
                e.stopPropagation();
                seekVideo(-10);
              }}
            >
              <Rewind className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-10 w-10" 
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex" 
              onClick={(e) => {
                e.stopPropagation();
                seekVideo(10);
              }}
            >
              <FastForward className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Right controls: fullscreen */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-10 w-10" 
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile controls - to ensure they don't disappear when touching */}
      <div 
        className={`fixed inset-0 bg-transparent z-0 ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default VideoPlayer;
