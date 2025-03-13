
import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Channel } from '@/types';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface PlayButtonProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ channel, onPlay }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // بسيط - فقط استدعاء دالة التشغيل مباشرة
    try {
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
      // تأخير قصير فقط
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <Button
      onClick={handlePlay}
      className="w-full mt-2 bg-gradient-to-r from-primary/90 to-primary shadow-md hover:shadow-lg transform hover:scale-105 duration-200 rounded-lg"
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin ml-2" />
      ) : (
        <Play size={18} className="ml-2" />
      )}
      <span className="text-base">{isLoading ? "جاري التحميل..." : "مشاهدة"}</span>
    </Button>
  );
};

export default PlayButton;
