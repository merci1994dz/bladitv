
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Link } from 'lucide-react';

interface VideoErrorProps {
  error: string;
  onRetry: (e: React.MouseEvent) => void;
  streamUrl?: string;
}

const VideoError: React.FC<VideoErrorProps> = ({ error, onRetry, streamUrl }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/80 backdrop-blur-md">
      <div className="bg-black/60 backdrop-blur-lg rounded-xl p-8 flex flex-col items-center justify-center max-w-md mx-auto border border-red-500/20 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        
        <h3 className="text-white text-xl font-bold mb-2">خطأ في التشغيل</h3>
        <p className="text-white/80 text-center mb-6">{error}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            className="bg-primary hover:bg-primary/90 text-white flex-1 flex items-center justify-center gap-2 rounded-lg"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4" />
            <span>إعادة المحاولة</span>
          </Button>
          
          {streamUrl && (
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 flex-1 flex items-center justify-center gap-2 rounded-lg"
              onClick={() => window.open(streamUrl, '_blank')}
            >
              <Link className="h-4 w-4" />
              <span>فتح الرابط</span>
            </Button>
          )}
        </div>
        
        {streamUrl && (
          <div className="mt-4 bg-gray-900/50 p-2 rounded-md w-full overflow-hidden">
            <p className="text-gray-400 text-xs text-center break-all">{streamUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoError;
