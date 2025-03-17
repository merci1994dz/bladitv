
import React from 'react';
import { Loader2 } from 'lucide-react';

const VideoSpinner: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
      <div className="relative">
        <Loader2 className="h-10 w-10 text-white animate-spin" />
        <span className="sr-only">جاري التحميل...</span>
      </div>
    </div>
  );
};

export default VideoSpinner;
