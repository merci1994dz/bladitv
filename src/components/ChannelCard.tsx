
import React from 'react';
import { Channel } from '@/types';
import { Heart, Play } from 'lucide-react';

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
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:translate-y-[-2px]">
      <div className="relative p-3">
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
            aria-label={channel.isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            <Heart fill={channel.isFavorite ? "#ef4444" : "none"} color={channel.isFavorite ? "#ef4444" : "currentColor"} size={24} />
          </button>
        </div>
        
        <h3 className="font-bold text-lg mb-1 text-right line-clamp-2">{channel.name}</h3>
        
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => onPlay(channel)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full w-full transition-colors flex items-center justify-center gap-2"
          >
            <Play size={16} />
            <span>مشاهدة</span>
          </button>
        </div>
      </div>
      
      {/* Overlay for full card clickability */}
      <div 
        className="absolute inset-0 cursor-pointer opacity-0"
        onClick={() => onPlay(channel)}
        aria-label={`مشاهدة ${channel.name}`}
      ></div>
    </div>
  );
};

export default ChannelCard;
