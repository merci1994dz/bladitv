
import React, { useEffect } from 'react';
import PlaybackControls from './controls/PlaybackControls';
import VolumeControls from './controls/VolumeControls';
import SettingsControls from './controls/SettingsControls';
import { Channel } from '@/types';
import { Button } from '../ui/button';
import { Calendar, ListVideo } from 'lucide-react';

export interface VideoControlsProps {
  show: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentVolume: number;
  onPlayPause: (e: React.MouseEvent) => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  onFullscreenToggle: (e: React.MouseEvent) => void;
  onVolumeChange: (value: number) => void;
  onSeek?: (seconds: number) => (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onReload?: (e: React.MouseEvent) => void;
  isTV?: boolean;
  channel?: Channel;
  onShowStreamSources?: () => void;
  onShowProgramGuide?: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  show,
  isPlaying,
  isMuted,
  isFullscreen,
  currentVolume,
  onPlayPause,
  onMuteToggle,
  onFullscreenToggle,
  onVolumeChange,
  onSeek,
  onClick,
  onReload,
  isTV = false,
  channel,
  onShowStreamSources,
  onShowProgramGuide
}) => {
  const [focusedButton, setFocusedButton] = React.useState<string | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isTV) return;

    switch (e.key) {
      case 'ArrowRight':
        if (focusedButton === null) {
          setFocusedButton('play');
        } else if (focusedButton === 'play') {
          setFocusedButton('volume');
        } else if (focusedButton === 'volume') {
          setFocusedButton('settings');
        } else if (focusedButton === 'settings') {
          setFocusedButton('fullscreen');
        } else if (focusedButton === 'fullscreen' && onReload) {
          setFocusedButton('reload');
        } else if (focusedButton === 'fullscreen' && !onReload && channel?.externalLinks && channel?.externalLinks?.length > 0) {
          setFocusedButton('external');
        } else if (focusedButton === 'external') {
          setFocusedButton('settings');
        }
        break;
      case 'ArrowLeft':
        if (focusedButton === null) {
          setFocusedButton('fullscreen');
        } else if (focusedButton === 'fullscreen') {
          setFocusedButton('settings');
        } else if (focusedButton === 'settings') {
          setFocusedButton('volume');
        } else if (focusedButton === 'volume') {
          setFocusedButton('play');
        } else if (focusedButton === 'play' && onReload) {
          setFocusedButton('reload');
        } else if (focusedButton === 'play' && !onReload && channel?.externalLinks && channel?.externalLinks?.length > 0) {
          setFocusedButton('external');
        } else if (focusedButton === 'external') {
          setFocusedButton('play');
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isTV && show) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      setFocusedButton(null);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTV, show, onReload, channel]);

  if (!show) return null;

  return (
    <div
      className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between bg-black/50 backdrop-blur-md z-20"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onSeek={onSeek || ((seconds: number) => (e: React.MouseEvent) => {})}
          isTV={isTV}
          focusedButton={focusedButton}
        />
        <VolumeControls
          isMuted={isMuted}
          currentVolume={currentVolume}
          onMuteToggle={onMuteToggle}
          onVolumeChange={(e: React.ChangeEvent<HTMLInputElement>) => onVolumeChange(parseFloat(e.target.value))}
          isTV={isTV}
          isFocused={focusedButton === 'volume'}
        />
      </div>

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        {onShowStreamSources && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/20 h-9 w-9 backdrop-blur-sm hidden md:flex"
            onClick={(e) => {
              e.stopPropagation();
              onShowStreamSources();
            }}
          >
            <ListVideo className="w-4 h-4" />
          </Button>
        )}

        {onShowProgramGuide && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-white/20 h-9 w-9 backdrop-blur-sm hidden md:flex"
            onClick={(e) => {
              e.stopPropagation();
              onShowProgramGuide();
            }}
          >
            <Calendar className="w-4 h-4" />
          </Button>
        )}

        <SettingsControls
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
          onReload={onReload}
          isTV={isTV}
          focusedButton={focusedButton === 'settings' ? 'fullscreen' : focusedButton}
          channel={channel}
        />
      </div>
    </div>
  );
};

export default VideoControls;
