
import React from 'react';
import { Channel } from '@/types';
import { Heart } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ 
  channel, 
  onPlay, 
  onToggleFavorite 
}) => {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-900 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
            }}
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            className="text-gray-500 hover:text-red-500 focus:outline-none transition-colors"
          >
            <Heart fill={channel.isFavorite ? "#ef4444" : "none"} color={channel.isFavorite ? "#ef4444" : "currentColor"} size={24} />
          </button>
        </div>
        
        <h3 className="font-bold text-lg mb-1 text-right">{channel.name}</h3>
        
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={() => onPlay(channel)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full w-full transition-colors"
          >
            مشاهدة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
