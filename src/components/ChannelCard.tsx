
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
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group border-0 bg-white dark:bg-gray-800/90 rounded-xl shadow-md">
      {/* خلفية متدرجة للبطاقة */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-800/90 dark:to-gray-900/80 opacity-80 group-hover:opacity-100 transition-opacity z-0"></div>
      
      {/* زر المفضلة */}
      <div className="absolute top-2 right-2 z-10 transform transition-transform duration-300 group-hover:scale-110">
        <FavoriteButton 
          isFavorite={channel.isFavorite} 
          onToggle={handleFavoriteToggle} 
        />
      </div>
      
      {/* آخر مشاهدة */}
      {lastWatched && (
        <div className="absolute top-2 left-2 z-10 transform transition-transform duration-300 group-hover:scale-110">
          <LastWatchedButton 
            lastWatched={lastWatched} 
            channel={channel} 
            onPlay={onPlay} 
          />
        </div>
      )}
      
      <CardContent className="p-4 z-10 relative">
        {/* شعار القناة بتأثيرات محسنة */}
        <ChannelLogo logo={channel.logo} name={channel.name} />
        
        {/* اسم القناة بتصميم محسن */}
        <h3 className="font-bold text-md text-center line-clamp-2 h-12 mb-3 group-hover:text-primary transition-colors">{channel.name}</h3>
        
        {/* شارة الفئة */}
        <CategoryBadge category={channel.category} />
        
        {/* زر التشغيل بتأثيرات محسنة */}
        <PlayButton channel={channel} onPlay={onPlay} />
      </CardContent>
      
      {/* طبقة متداخلة لقابلية النقر على البطاقة بالكامل */}
      <div 
        className="absolute inset-0 cursor-pointer opacity-0"
        onClick={() => onPlay(channel)}
        aria-label={`مشاهدة ${channel.name}`}
      ></div>
      
      {/* تأثير توهج عند مرور المؤشر */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/80 to-blue-600/80 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
    </Card>
  );
};

export default ChannelCard;
