
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Info, Globe } from 'lucide-react';
import { Channel } from '@/types';

interface VideoHeaderProps {
  channel: Channel;
  onClose: (e: React.MouseEvent) => void;
  showControls: boolean;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ channel, onClose, showControls }) => {
  return (
    <div 
      className={`p-4 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
            }}
          />
        </div>
        <div>
          <h2 className="text-white text-xl font-bold shadow-text">{channel.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            {channel.category && (
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-xs">
                <Info className="w-3 h-3 text-white/70" />
                <span className="text-white/80">{channel.category}</span>
              </div>
            )}
            
            {channel.country && (
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-xs">
                <Globe className="w-3 h-3 text-white/70" />
                <span className="text-white/80">{channel.country}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        className="rounded-full text-white hover:bg-red-500/20 h-10 w-10 backdrop-blur-sm border border-white/10" 
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default VideoHeader;
