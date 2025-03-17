
import { Channel } from '@/types';
import { MouseEvent } from 'react';

export interface VideoControlsProps {
  show: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentVolume: number;
  onPlayPause: (e: MouseEvent) => void;
  onMuteToggle: (e: MouseEvent) => void;
  onFullscreenToggle: (e: MouseEvent) => void;
  onVolumeChange: (value: number) => void;
  onSeek?: (seconds: number) => (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
  onReload?: (e: MouseEvent) => void;
  currentTime?: number;
  duration?: number;
  buffered?: number;
  channel: Channel;
  onClose?: () => void; // Added onClose as an optional property
}
