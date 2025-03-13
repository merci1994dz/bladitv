
import React from 'react';

interface VideoLoadingProps {
  retryCount?: number;
}

const VideoLoading: React.FC<VideoLoadingProps> = ({ retryCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/80 backdrop-blur-md">
      <div className="w-16 h-16 border-t-4 border-r-4 border-b-4 border-l-transparent rounded-full animate-spin mb-4 border-primary"></div>
      <p className="text-white text-sm bg-black/70 px-5 py-2 rounded-lg font-medium">
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
