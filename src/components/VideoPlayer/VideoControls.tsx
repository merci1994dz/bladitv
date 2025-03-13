
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  FastForward, 
  Rewind,
  Settings,
  SkipBack,
  SkipForward,
  RefreshCw
} from 'lucide-react';

interface VideoControlsProps {
  show: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentVolume: number;
  onPlayPause: (e: React.MouseEvent) => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  onFullscreenToggle: (e: React.MouseEvent) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeek: (seconds: number) => (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onReload?: (e: React.MouseEvent) => void;
  isTV?: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  show,
  isPlaying,
  isMuted,
  isFullscreen,
  currentVolume,
  onPlayPause,
  onMuteToggle,
  onFullscreenToggle,
  onVolumeChange,
  onSeek,
  onClick,
  onReload,
  isTV = false
}) => {
  const [focusedButton, setFocusedButton] = useState<string | null>(null);
  
  // TV remote control keyboard navigation
  useEffect(() => {
    if (!isTV) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          // Trigger action on focused button
          if (focusedButton === 'play') {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.getElementById('video-play-button')?.dispatchEvent(event);
          } else if (focusedButton === 'mute') {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.getElementById('video-mute-button')?.dispatchEvent(event);
          }
          // Add other buttons as needed
          break;
        
        // Handle directional navigation
        case 'ArrowRight':
          if (focusedButton === 'play') {
            setFocusedButton('forward');
          } else if (focusedButton === 'mute') {
            setFocusedButton('play');
          }
          e.preventDefault();
          break;
          
        case 'ArrowLeft':
          if (focusedButton === 'play') {
            setFocusedButton('mute');
          } else if (focusedButton === 'forward') {
            setFocusedButton('play');
          }
          e.preventDefault();
          break;
          
        // Space is often used as play/pause on TVs
        case ' ':
          onPlayPause(new MouseEvent('click') as any);
          e.preventDefault();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Set initial focus (usually on play/pause)
    setFocusedButton('play');
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTV, focusedButton, onPlayPause]);

  return (
    <>
      {/* Center play/pause button (visible on tap or hover) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 cursor-pointer pointer-events-none transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className={`bg-black/50 backdrop-blur-md rounded-full p-7 shadow-2xl transform transition-transform hover:scale-105 border ${focusedButton === 'play' && isTV ? 'border-primary border-2' : 'border-white/10'}`}>
          {isPlaying ? 
            <Pause className="w-16 h-16 text-white" /> : 
            <Play className="w-16 h-16 text-white" />
          }
        </div>
      </div>
      
      {/* Footer controls */}
      <div 
        className={`p-5 flex flex-col justify-end items-stretch bg-gradient-to-t from-black/90 via-black/70 to-transparent absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress bar (non-functional but adds to the UI) */}
        <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden hover:h-2.5 transition-all cursor-pointer group">
          <div className="w-[30%] h-full bg-primary rounded-full relative group-hover:shadow-lg">
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-primary shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex justify-between items-center">
          {/* Left controls: volume */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button 
              id="video-mute-button"
              variant="ghost" 
              size="icon"
              className={`rounded-full text-white hover:bg-white/20 h-10 w-10 backdrop-blur-sm ${focusedButton === 'mute' && isTV ? 'ring-2 ring-primary' : ''}`}
              onClick={onMuteToggle}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            {/* Volume slider */}
            <div 
              className="w-24 hidden md:block" 
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : currentVolume}
                onChange={onVolumeChange}
                className="slider-thumb w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 focus:outline-none"
              />
            </div>
          </div>
          
          {/* Center controls: rewind, play, fast-forward */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button 
              id="video-rewind-button"
              variant="ghost" 
              size="icon"
              className={`rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex backdrop-blur-sm ${focusedButton === 'rewind' && isTV ? 'ring-2 ring-primary' : ''}`}
              onClick={onSeek(-10)}
            >
              <Rewind className="w-4 h-4" />
            </Button>
            
            <Button 
              id="video-play-button"
              variant="ghost" 
              size="icon"
              className={`rounded-full text-white hover:bg-white/20 h-14 w-14 border border-white/30 backdrop-blur-sm shadow-md ${focusedButton === 'play' && isTV ? 'ring-2 ring-primary' : ''}`}
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
            </Button>
            
            <Button 
              id="video-forward-button"
              variant="ghost" 
              size="icon"
              className={`rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex backdrop-blur-sm ${focusedButton === 'forward' && isTV ? 'ring-2 ring-primary' : ''}`}
              onClick={onSeek(10)}
            >
              <FastForward className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Right controls: reload, settings, fullscreen */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {onReload && (
              <Button 
                id="video-reload-button"
                variant="ghost" 
                size="icon"
                className={`rounded-full text-white hover:bg-white/20 h-9 w-9 backdrop-blur-sm ${focusedButton === 'reload' && isTV ? 'ring-2 ring-primary' : ''}`}
                onClick={onReload}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            
            <Button 
              id="video-settings-button"
              variant="ghost" 
              size="icon"
              className={`rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex backdrop-blur-sm ${focusedButton === 'settings' && isTV ? 'ring-2 ring-primary' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button 
              id="video-fullscreen-button"
              variant="ghost" 
              size="icon"
              className={`rounded-full text-white hover:bg-white/20 h-10 w-10 backdrop-blur-sm ${focusedButton === 'fullscreen' && isTV ? 'ring-2 ring-primary' : ''}`}
              onClick={onFullscreenToggle}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile controls - to ensure they don't disappear when touching */}
      <div 
        className={`fixed inset-0 bg-transparent z-0 ${show ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={onClick}
      />
      
      {/* TV Remote Helper UI (only shown on TV devices) */}
      {isTV && show && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs flex gap-4">
            <div className="flex items-center">
              <span className="border rounded px-1.5 mx-1">◄</span>
              <span className="border rounded px-1.5 mx-1">►</span>
              <span className="mr-1">تنقل</span>
            </div>
            <div className="flex items-center">
              <span className="border rounded px-1.5 mx-1">OK</span>
              <span className="mr-1">اختيار</span>
            </div>
            <div className="flex items-center">
              <span className="border rounded px-1.5 mx-1">مسافة</span>
              <span className="mr-1">تشغيل/إيقاف</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoControls;
