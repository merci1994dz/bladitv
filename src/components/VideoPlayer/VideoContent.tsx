
import React from 'react';
import { Channel } from '@/types';
import VideoError from './VideoError';
import VideoLoading from './VideoLoading';
import StreamSources from '../channel/StreamSources';
import ProgramGuide from '../guide/ProgramGuide';
import VideoSidebar from './sidebars/VideoSidebar';

interface VideoContentProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  retryPlayback: () => void;
  channel: Channel;
  currentStreamUrl: string;
  showStreamSources: boolean;
  showProgramGuide: boolean;
  setShowStreamSources: (show: boolean) => void;
  setShowProgramGuide: (show: boolean) => void;
  handleChangeStreamSource: (url: string) => void;
  showControls: boolean;
  handleMouseMove: () => void;
}

const VideoContent: React.FC<VideoContentProps> = ({
  videoRef,
  isLoading,
  error,
  retryCount,
  retryPlayback,
  channel,
  currentStreamUrl,
  showStreamSources,
  showProgramGuide,
  setShowStreamSources,
  setShowProgramGuide,
  handleChangeStreamSource,
  showControls,
  handleMouseMove
}) => {
  // معالج Retry
  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    retryPlayback();
  };

  return (
    <div 
      className="flex-1 flex items-center justify-center relative"
      onMouseMove={handleMouseMove}
    >
      {isLoading && <VideoLoading retryCount={retryCount} />}
      
      {error && (
        <VideoError 
          error={error} 
          onRetry={handleRetry} 
          streamUrl={currentStreamUrl}
        />
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={false}
        playsInline
      />
      
      {/* صندوق جانبي لمصادر البث المتعددة */}
      <VideoSidebar
        title="مصادر البث"
        isOpen={showStreamSources}
        onClose={() => setShowStreamSources(false)}
        position="left"
      >
        <StreamSources 
          channel={channel} 
          onSelectSource={handleChangeStreamSource}
          selectedUrl={currentStreamUrl}
        />
      </VideoSidebar>
      
      {/* صندوق جانبي لدليل البرامج */}
      <VideoSidebar
        title="دليل البرامج"
        isOpen={showProgramGuide}
        onClose={() => setShowProgramGuide(false)}
        position="right"
      >
        <ProgramGuide channelId={channel.id} />
      </VideoSidebar>
    </div>
  );
};

export default VideoContent;
