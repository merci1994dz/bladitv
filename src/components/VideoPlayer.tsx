
import React, { useRef, useEffect, useState } from 'react';
import { Channel } from '@/types';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Maximize, Minimize, X, RotateCcw } from 'lucide-react';

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

  // Initialize video player
  useEffect(() => {
    if (videoRef.current) {
      // Set properties
      videoRef.current.src = channel.streamUrl;
      videoRef.current.muted = isMuted;
      
      // Play the video
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setError('فشل في تشغيل البث. يرجى المحاولة مرة أخرى.');
            setIsLoading(false);
            setIsPlaying(false);
          });
      }
    }

    // Cleanup
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      // Exit fullscreen on unmount if needed
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [channel.streamUrl]);

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
          autoPlay
          playsInline
        />
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
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoPlayer;
