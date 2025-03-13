
import React from 'react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
      {retryCount && retryCount > 0 && (
        <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full animate-pulse">
          جاري المحاولة ({retryCount})...
        </p>
      )}
    </div>
  );
};

export default VideoLoading;
