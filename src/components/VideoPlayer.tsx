
import React, { useRef, useEffect } from 'react';
import { Channel } from '@/types';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = channel.streamUrl;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [channel.streamUrl]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <img src={channel.logo} alt={channel.name} className="w-10 h-10 object-contain bg-black/20 rounded" />
          <h2 className="text-white text-xl font-bold">{channel.name}</h2>
        </div>
        <button 
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded-full"
        >
          إغلاق
        </button>
      </div>
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        autoPlay
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;
