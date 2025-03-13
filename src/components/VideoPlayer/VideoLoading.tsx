
import React from 'react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white text-sm bg-black/70 px-4 py-2 rounded-lg">
        جاري تحميل الفيديو...
      </p>
      {retryCount && retryCount > 0 && (
        <p className="text-white text-sm bg-black/70 px-4 py-2 rounded-lg mt-2 animate-pulse">
          جاري المحاولة ({retryCount})...
        </p>
      )}
    </div>
  );
};

export default VideoLoading;
