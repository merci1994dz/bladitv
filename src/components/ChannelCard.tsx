
import React from 'react';
import { Channel } from '@/types';
import { Heart, Play, Tv } from 'lucide-react';

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
    <div className="relative bg-white dark:bg-gray-800/90 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:translate-y-[-3px] group">
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          className="bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 text-gray-500 hover:text-red-500 focus:outline-none transition-colors backdrop-blur-sm shadow-md"
          aria-label={channel.isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart fill={channel.isFavorite ? "#ef4444" : "none"} color={channel.isFavorite ? "#ef4444" : "currentColor"} size={18} />
        </button>
      </div>
      
      <div className="relative p-4">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-2 w-20 h-20 flex items-center justify-center">
            {channel.logo ? (
              <img 
                src={channel.logo} 
                alt={channel.name} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
                }}
              />
            ) : (
              <Tv className="h-10 w-10 text-gray-400" />
            )}
          </div>
        </div>
        
        <h3 className="font-bold text-md text-center line-clamp-2 h-12 mb-3">{channel.name}</h3>
        
        <button
          onClick={() => onPlay(channel)}
          className="bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-full w-full transition-colors flex items-center justify-center gap-2 mt-2 shadow-md group-hover:shadow-lg"
        >
          <Play size={16} />
          <span>مشاهدة</span>
        </button>
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
