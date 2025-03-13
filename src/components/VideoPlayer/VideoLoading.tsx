
import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/70 backdrop-blur-lg">
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 flex flex-col items-center justify-center glass-dark">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-white text-base font-medium mb-1">
          جاري تحميل الفيديو...
        </p>
        {retryCount && retryCount > 0 && (
          <p className="text-white/80 text-sm bg-black/50 px-4 py-1.5 rounded-full mt-2 animate-pulse">
            جاري المحاولة ({retryCount})...
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoLoading;
