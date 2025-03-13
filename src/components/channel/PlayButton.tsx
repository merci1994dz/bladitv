
import React from 'react';
import { Play } from 'lucide-react';
import { Channel } from '@/types';

interface PlayButtonProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ channel, onPlay }) => {
  return (
    <button
      onClick={() => onPlay(channel)}
      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full w-full transition-colors flex items-center justify-center gap-2 mt-2 shadow-md group-hover:shadow-lg"
    >
      <Play size={16} />
      <span>مشاهدة</span>
    </button>
  );
};

export default PlayButton;
