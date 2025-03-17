
import { Channel } from '@/types';
import { MouseEvent } from 'react';

export interface VideoControlsProps {
  show: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentVolume: number;
  onPlayPause: () => void;
  onMuteToggle: (e: MouseEvent<Element, MouseEvent>) => void;
  onVolumeChange: (value: number) => void;
  onFullscreenToggle: () => void;
  onSeek: (seconds: number) => (e: MouseEvent<Element, MouseEvent>) => void;
  currentTime: number;
  duration: number;
  buffered: number;
  channel: Channel;
  onClose?: () => void; // Make this optional to maintain compatibility
}
