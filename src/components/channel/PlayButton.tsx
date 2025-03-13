
import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Channel } from '@/types';
import { toast } from "@/hooks/use-toast";
import { playChannel } from '@/services/channelService';

interface PlayButtonProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ channel, onPlay }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // تسجيل القناة في تاريخ المشاهدة
      await playChannel(channel.id);
      
      // استدعاء دالة التشغيل
      onPlay(channel);
      
      toast({
        title: `جاري تشغيل ${channel.name}`,
        description: "يتم تحميل البث...",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error playing channel:', error);
      toast({
        title: "فشل في تشغيل القناة",
        description: "حدث خطأ أثناء محاولة تشغيل القناة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full w-full transition-colors flex items-center justify-center gap-2 mt-2 shadow-md group-hover:shadow-lg transform group-hover:scale-105 duration-200"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Play size={16} />
      )}
      <span>{isLoading ? "جاري التحميل..." : "مشاهدة"}</span>
    </button>
  );
};

export default PlayButton;
