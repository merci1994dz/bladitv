
import React from 'react';
import { Channel } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { VIDEO_PLAYER } from '@/services/config';
import FavoriteButton from './channel/FavoriteButton';
import LastWatchedButton from './channel/LastWatchedButton';
import ChannelLogo from './channel/ChannelLogo';
import CategoryBadge from './channel/CategoryBadge';
import PlayButton from './channel/PlayButton';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  lastWatched?: number;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ 
  channel, 
  onPlay, 
  onToggleFavorite,
  lastWatched
}) => {
  // إنشاء نسخة آمنة من القناة لعرض واجهة المستخدم
  const secureChannel = React.useMemo(() => {
    if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
      const { streamUrl, ...rest } = channel;
      return {
        ...rest,
        streamUrl: channel.streamUrl,
        _displayUrl: '[محمي]'
      };
    }
    return channel;
  }, [channel]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(channel.id);
  };

  return (
    <Card className="relative overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:translate-y-[-3px] group bg-gradient-to-b from-white to-gray-50 dark:from-gray-800/90 dark:to-gray-900/80">
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton 
          isFavorite={channel.isFavorite} 
          onToggle={handleFavoriteToggle} 
        />
      </div>
      
      {lastWatched && (
        <div className="absolute top-2 left-2 z-10">
          <LastWatchedButton 
            lastWatched={lastWatched} 
            channel={channel} 
            onPlay={onPlay} 
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <ChannelLogo logo={channel.logo} name={channel.name} />
        
        <h3 className="font-bold text-md text-center line-clamp-2 h-12 mb-3">{channel.name}</h3>
        
        <CategoryBadge category={channel.category} />
        
        <PlayButton channel={channel} onPlay={onPlay} />
      </CardContent>
      
      {/* طبقة متداخلة لقابلية النقر على البطاقة بالكامل */}
      <div 
        className="absolute inset-0 cursor-pointer opacity-0"
        onClick={() => onPlay(channel)}
        aria-label={`مشاهدة ${channel.name}`}
      ></div>
    </Card>
  );
};

export default ChannelCard;
