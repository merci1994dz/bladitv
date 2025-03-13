
import React from 'react';
import { Clock } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';
import { Channel } from '@/types';

interface LastWatchedButtonProps {
  lastWatched: number;
  channel: Channel;
  onPlay: (channel: Channel) => void;
}

const LastWatchedButton: React.FC<LastWatchedButtonProps> = ({ 
  lastWatched, 
  channel, 
  onPlay 
}) => {
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
  );
};

export default LastWatchedButton;
