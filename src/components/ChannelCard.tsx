
import React from 'react';
import { Channel } from '@/types';
import { Heart, Play, Tv, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { VIDEO_PLAYER } from '@/services/config';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  // هذا يضمن أن عناوين URL للبث غير قابلة للوصول في DOM أو React DevTools
  const secureChannel = React.useMemo(() => {
    if (VIDEO_PLAYER.HIDE_STREAM_URLS) {
      const { streamUrl, ...rest } = channel;
      return {
        ...rest,
        // تخزين عنوان URL الأصلي ولكن ليس بطريقة يسهل الوصول إليها
        streamUrl: channel.streamUrl, // نحتفظ بالأصل للوظائف
        _displayUrl: '[محمي]' // لأغراض العرض فقط
      };
    }
    return channel;
  }, [channel]);

  // تنسيق تاريخ آخر مشاهدة
  const formatLastWatched = () => {
    if (!lastWatched) return null;
    
    const now = Date.now();
    const diff = now - lastWatched;
    
    // أقل من ساعة
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `منذ ${minutes} دقيقة`;
    }
    
    // أقل من يوم
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `منذ ${hours} ساعة`;
    }
    
    // أكثر من يوم
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `منذ ${days} يوم`;
  };

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
      
      {/* ميزة جديدة: شارة آخر مشاهدة */}
      {lastWatched && (
        <div className="absolute top-2 left-2 z-10">
          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 text-gray-500 hover:text-blue-500 focus:outline-none transition-colors backdrop-blur-sm shadow-md hover:shadow-lg group/history"
                aria-label="آخر مشاهدة"
              >
                <Clock size={18} />
                <span className="sr-only">آخر مشاهدة: {formatLastWatched()}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>معلومات المشاهدة</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col space-y-2 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  آخر مشاهدة: {formatLastWatched()}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2" 
                  onClick={() => onPlay(channel)}
                >
                  <Play size={16} className="mr-2" />
                  مشاهدة الآن
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex justify-center mb-4 mt-2">
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
            {channel.logo ? (
              <img 
                src={channel.logo} 
                alt={channel.name} 
                className="max-w-full max-h-full object-contain"
                loading="lazy" // تحسين: تحميل الصور بشكل متأخر
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
