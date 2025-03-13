
import React from 'react';
import { Loader2 } from 'lucide-react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/70 backdrop-blur-lg">
      <div className="bg-black/60 backdrop-blur-lg rounded-xl p-8 flex flex-col items-center justify-center glass-dark border border-white/5 shadow-2xl">
        <div className="w-20 h-20 relative mb-4">
          <Loader2 className="h-14 w-14 text-primary animate-spin absolute" />
          <div className="h-20 w-20 rounded-full border-t-2 border-b-2 border-white/20 animate-spin absolute"></div>
        </div>
        
        <p className="text-white text-lg font-medium mb-1">
          جاري تحميل الفيديو...
        </p>
        
        {retryCount && retryCount > 0 && (
          <div className="mt-3 flex flex-col items-center">
            <p className="text-white/80 text-sm bg-black/70 px-4 py-1.5 rounded-full animate-pulse border border-white/10">
              جاري المحاولة ({retryCount})...
            </p>
            <div className="mt-3 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[progress_1.5s_linear_infinite]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLoading;
