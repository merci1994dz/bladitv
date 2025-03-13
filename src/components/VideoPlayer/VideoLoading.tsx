
import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/70 backdrop-blur-lg">
      <div className="bg-black/60 backdrop-blur-lg rounded-xl p-8 flex flex-col items-center justify-center border border-white/5 shadow-2xl">
        <div className="w-20 h-20 relative mb-4">
          <Loader2 className="h-14 w-14 text-primary animate-spin" />
        </div>
        
        <p className="text-white text-lg font-medium mb-1">
          جاري تحميل الفيديو...
        </p>
        
        {retryCount && retryCount > 0 && (
          <p className="text-white/80 text-sm mt-2">
            جاري المحاولة ({retryCount})...
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoLoading;
