
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw } from 'lucide-react';

interface VideoErrorProps {
  error: string;
  onRetry: (e: React.MouseEvent) => void;
}

const VideoError: React.FC<VideoErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-4">
      <div className="max-w-md w-full bg-gray-900/90 p-5 rounded-lg shadow-lg backdrop-blur-sm">
        <p className="text-white text-lg mb-4 text-center">
          <span className="text-red-400 block text-4xl mb-2">⚠️</span>
          {error}
        </p>
        <div className="flex justify-center">
          <Button onClick={onRetry} className="bg-primary hover:bg-primary/90 gap-2">
            <RotateCcw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoError;
