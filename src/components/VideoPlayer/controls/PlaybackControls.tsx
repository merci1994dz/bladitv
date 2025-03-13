
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, FastForward, Rewind } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: (e: React.MouseEvent) => void;
  onSeek: (seconds: number) => (e: React.MouseEvent) => void;
  isTV?: boolean;
  focusedButton: string | null;
}

// Define the props type for CenterPlayButton
interface CenterPlayButtonProps {
  isPlaying: boolean;
  isFocused: boolean;
}

// Define the combined interface for PlaybackControls with static property
interface PlaybackControlsComponent extends React.FC<PlaybackControlsProps> {
  CenterPlayButton: React.FC<CenterPlayButtonProps>;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  onSeek,
  isTV = false,
  focusedButton
}) => {
  return (
    <div className="flex items-center space-x-4 rtl:space-x-reverse">
      <Button 
        id="video-rewind-button"
        variant="ghost" 
        size="icon"
        className={`rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex backdrop-blur-sm transform transition-all duration-300 hover:scale-110 ${focusedButton === 'rewind' && isTV ? 'ring-2 ring-primary' : ''}`}
        onClick={onSeek(-10)}
      >
        <Rewind className="w-4 h-4" />
      </Button>
      
      <Button 
        id="video-play-button"
        variant="ghost" 
        size="icon"
        className={`rounded-full text-white hover:bg-white/20 h-14 w-14 border border-white/30 backdrop-blur-sm shadow-md transform transition-all duration-300 hover:scale-105 ${focusedButton === 'play' && isTV ? 'ring-2 ring-primary' : ''}`}
        onClick={onPlayPause}
      >
        {isPlaying ? 
          <Pause className="w-7 h-7 animate-fade-in" /> : 
          <Play className="w-7 h-7 animate-fade-in" />
        }
      </Button>
      
      <Button 
        id="video-forward-button"
        variant="ghost" 
        size="icon"
        className={`rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex backdrop-blur-sm transform transition-all duration-300 hover:scale-110 ${focusedButton === 'forward' && isTV ? 'ring-2 ring-primary' : ''}`}
        onClick={onSeek(10)}
      >
        <FastForward className="w-4 h-4" />
      </Button>
    </div>
  );
};

// زر التشغيل المركزي الكبير
const CenterPlayButton: React.FC<CenterPlayButtonProps> = ({ 
  isPlaying,
  isFocused 
}) => {
  return (
    <div className={`bg-black/50 backdrop-blur-md rounded-full p-7 shadow-2xl transform transition-all duration-300 hover:scale-105 ${isFocused ? 'border-primary border-2 animate-pulse-slow' : 'border-white/10 border'}`}>
      {isPlaying ? 
        <Pause className="w-16 h-16 text-white animate-fade-in" /> : 
        <Play className="w-16 h-16 text-white animate-fade-in" />
      }
    </div>
  );
};

// Cast PlaybackControls to the interface with the static property
const PlaybackControlsWithComponent = PlaybackControls as PlaybackControlsComponent;

// Attach CenterPlayButton as a static property
PlaybackControlsWithComponent.CenterPlayButton = CenterPlayButton;

// Export the component with the static property
export default PlaybackControlsWithComponent;
