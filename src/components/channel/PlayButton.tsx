
import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useDeviceType } from '@/hooks/use-tv';

interface PlayButtonProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ channel, onPlay }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isTV } = useDeviceType();
  const { toast } = useToast();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // مباشرة استدعاء وظيفة التشغيل
      onPlay(channel);
      
      // تم تقليل الإشعارات ولكن نعرض إشعارًا بسيطًا لمدة قصيرة
      toast({
        title: `جاري تشغيل ${channel.name}`,
        description: isTV ? "استخدم أزرار التحكم بجهاز التلفزيون للتحكم" : "يتم تحميل البث...",
        duration: 2000,
      });
      
      // تأخير قصير قبل تغيير حالة التحميل
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error playing channel:', error);
      
      toast({
        title: "فشل في تشغيل القناة",
        description: "حدث خطأ أثناء محاولة تشغيل القناة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
        duration: 3000,
      });
      
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePlay}
      className={`w-full mt-2 bg-gradient-to-r from-primary/90 to-primary shadow-md hover:shadow-lg 
        transform hover:scale-105 duration-200 rounded-lg ${isTV ? 'tv-focus-item py-3' : ''}`}
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin ml-2" />
      ) : (
        <Play size={18} className="ml-2" />
      )}
      <span className={`${isTV ? 'text-lg' : 'text-base'} font-medium`}>{isLoading ? "جاري التحميل..." : "مشاهدة"}</span>
    </Button>
  );
};

export default PlayButton;
