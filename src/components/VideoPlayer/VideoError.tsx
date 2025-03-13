
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, ExternalLink, AlertCircle, AlertTriangle } from 'lucide-react';

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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-40 p-4">
      <div className="max-w-md w-full bg-gray-900/90 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-red-500/30 animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <p className="text-white text-lg mb-6 text-center">
          {error}
        </p>
        
        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} className="bg-primary hover:bg-primary/90 gap-2 w-full rounded-lg h-12">
            <RotateCcw className="w-5 h-5" />
            إعادة المحاولة
          </Button>
          
          {isFormatError && externalUrl && (
            <div className="mt-5 border-t border-gray-700 pt-5">
              <p className="text-xs text-gray-400 mb-3 text-center">
                إذا استمرت المشكلة، يمكنك محاولة فتح البث في مشغل خارجي:
              </p>
              <a 
                href={externalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 rounded-lg py-2 hover:bg-blue-500/20"
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
