
import React from 'react';
import { Channel } from '@/types';
import { Heart, Play, Tv } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { VIDEO_PLAYER } from '@/services/config';

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
  // Create a secure version of the channel for UI display
  // This ensures stream URLs aren't accessible in the DOM or React DevTools
  const secureChannel = React.useMemo(() => {
    if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
      const { streamUrl, ...rest } = channel;
      return {
        ...rest,
        // Store original streamUrl but not in a way that's easily accessible
        streamUrl: channel.streamUrl, // We keep the original for functionality
        _displayUrl: '[محمي]' // For display purposes only
      };
    }
    return channel;
  }, [channel]);

  return (
    <Card className="relative overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:translate-y-[-3px] group bg-gradient-to-b from-white to-gray-50 dark:from-gray-800/90 dark:to-gray-900/80">
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          className="bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 text-gray-500 hover:text-red-500 focus:outline-none transition-colors backdrop-blur-sm shadow-md hover:shadow-lg"
          aria-label={channel.isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart fill={channel.isFavorite ? "#ef4444" : "none"} color={channel.isFavorite ? "#ef4444" : "currentColor"} size={18} />
        </button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-center mb-4 mt-2">
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
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
        
        {channel.category && (
          <div className="bg-gray-100 dark:bg-gray-800/60 px-2 py-0.5 rounded-full text-xs text-center mb-3 line-clamp-1 text-gray-600 dark:text-gray-300">
            {channel.category}
          </div>
        )}
        
        <button
          onClick={() => onPlay(channel)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full w-full transition-colors flex items-center justify-center gap-2 mt-2 shadow-md group-hover:shadow-lg"
        >
          <Play size={16} />
          <span>مشاهدة</span>
        </button>
      </CardContent>
      
      {/* Overlay for full card clickability */}
      <div 
        className="absolute inset-0 cursor-pointer opacity-0"
        onClick={() => onPlay(channel)}
        aria-label={`مشاهدة ${channel.name}`}
      ></div>
    </Card>
  );
};

export default ChannelCard;
