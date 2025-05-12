
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

  // تحسين معالج النقر على القناة
  const handleChannelClick = () => {
    onPlay(channel);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(channel.id);
  };

  return (
    <div className="tv-channel-card" onClick={handleChannelClick}>
      <img 
        src={channel.logo} 
        alt={channel.name} 
        className="tv-channel-logo"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
      <div className="tv-channel-name">{channel.name}</div>
      {channel.isFavorite && (
        <div className="absolute top-2 right-2">
          <span className="text-yellow-500">★</span>
        </div>
      )}
    </div>
  );
};

export default ChannelCard;
