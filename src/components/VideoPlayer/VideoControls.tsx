
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  FastForward, 
  Rewind 
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
  onClick
}) => {
  return (
    <>
      {/* Center play/pause button (visible on tap or hover) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 cursor-pointer pointer-events-none transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="bg-black/40 rounded-full p-5 backdrop-blur-sm">
          {isPlaying ? 
            <Pause className="w-14 h-14 text-white" /> : 
            <Play className="w-14 h-14 text-white" />
          }
        </div>
      </div>
      
      {/* Footer controls */}
      <div className={`p-4 flex flex-col justify-end items-stretch bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
        {/* Control buttons */}
        <div className="flex justify-between items-center">
          {/* Left controls: volume */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-10 w-10" 
              onClick={onMuteToggle}
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
                onChange={onVolumeChange}
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
              onClick={onSeek(-10)}
            >
              <Rewind className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-10 w-10" 
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex" 
              onClick={onSeek(10)}
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
    </>
  );
};

export default VideoControls;
