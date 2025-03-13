
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Channel } from '@/types';

interface VideoHeaderProps {
  channel: Channel;
  onClose: (e: React.MouseEvent) => void;
  show: boolean;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ channel, onClose, show }) => {
  return (
    <div 
      className={`p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
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
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default VideoHeader;
