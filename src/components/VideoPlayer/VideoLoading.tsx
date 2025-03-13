
import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/70">
      <div className="bg-black/60 rounded-xl p-4 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
        
        <p className="text-white text-base font-medium">
          جاري تحميل الفيديو...
        </p>
        
        {retryCount && retryCount > 0 && (
          <p className="text-white/70 text-xs mt-1">
            محاولة ({retryCount})
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoLoading;
