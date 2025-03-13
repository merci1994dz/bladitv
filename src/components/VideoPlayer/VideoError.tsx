
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface VideoErrorProps {
  error: string;
  onRetry: (e: React.MouseEvent) => void;
  streamUrl?: string;
}

const VideoError: React.FC<VideoErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/80">
      <div className="bg-black/70 rounded-xl p-4 flex flex-col items-center justify-center max-w-sm mx-auto border border-red-500/20">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        
        <h3 className="text-white text-lg font-bold mb-1">خطأ في التشغيل</h3>
        <p className="text-white/80 text-sm text-center mb-3">{error}</p>
        
        <Button
          variant="default"
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 px-4"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          <span>إعادة المحاولة</span>
        </Button>
      </div>
    </div>
  );
};

export default VideoError;
