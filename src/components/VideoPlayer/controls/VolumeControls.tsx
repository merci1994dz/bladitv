
import React from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlsProps {
  isMuted: boolean;
  currentVolume: number;
  onMuteToggle: (e: React.MouseEvent) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isTV?: boolean;
  isFocused?: boolean;
}

const VolumeControls: React.FC<VolumeControlsProps> = ({
  isMuted,
  currentVolume,
  onMuteToggle,
  onVolumeChange,
  isTV = false,
  isFocused = false
}) => {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Button 
        id="video-mute-button"
        variant="ghost" 
        size="icon"
        className={`rounded-full text-white hover:bg-white/20 h-10 w-10 backdrop-blur-sm ${isFocused && isTV ? 'ring-2 ring-primary' : ''}`}
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
  );
};

export default VolumeControls;
