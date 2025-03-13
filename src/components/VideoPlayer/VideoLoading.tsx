
import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/70 backdrop-blur-sm">
      <div className="bg-black/60 rounded-xl p-6 flex flex-col items-center justify-center border border-white/10 shadow-xl">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
        
        <p className="text-white text-lg font-medium">
          جاري تحميل الفيديو...
        </p>
        
        {retryCount && retryCount > 0 && (
          <p className="text-white/70 text-sm mt-2">
            جاري المحاولة ({retryCount})...
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoLoading;
