
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, ExternalLink } from 'lucide-react';

interface VideoErrorProps {
  error: string;
  onRetry: (e: React.MouseEvent) => void;
  streamUrl?: string;
}

const VideoError: React.FC<VideoErrorProps> = ({ error, onRetry, streamUrl }) => {
  // تنظيف عنوان البث لاستخدامه في الرابط الخارجي (إذا كان متاحًا)
  let externalUrl = streamUrl;
  
  // تحديد إذا كان الخطأ متعلق بتنسيق غير مدعوم
  const isFormatError = error.includes('تنسيق') || error.includes('غير مدعوم');
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-4">
      <div className="max-w-md w-full bg-gray-900/90 p-5 rounded-lg shadow-lg backdrop-blur-sm border border-red-500/30">
        <p className="text-white text-lg mb-4 text-center">
          <span className="text-red-400 block text-4xl mb-2">⚠️</span>
          {error}
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={onRetry} className="bg-primary hover:bg-primary/90 gap-2 w-full">
            <RotateCcw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
          
          {isFormatError && externalUrl && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <p className="text-xs text-gray-400 mb-2 text-center">
                إذا استمرت المشكلة، يمكنك محاولة فتح البث في مشغل خارجي:
              </p>
              <a 
                href={externalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                فتح في مشغل خارجي
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoError;
