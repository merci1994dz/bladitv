
import React, { useEffect, useState } from 'react';
import VolumeControls from './controls/VolumeControls';
import PlaybackControls from './controls/PlaybackControls';
import SettingsControls from './controls/SettingsControls';
import TVRemoteHelp from './controls/TVRemoteHelp';

interface VideoControlsProps {
  show: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentVolume: number;
  onPlayPause: (e: React.MouseEvent) => void;
  onMuteToggle: (e: React.MouseEvent) => void;
  onFullscreenToggle: (e: React.MouseEvent) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeek: (seconds: number) => (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onReload?: (e: React.MouseEvent) => void;
  isTV?: boolean;
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
  isTV = false
}) => {
  const [focusedButton, setFocusedButton] = useState<string | null>(null);
  
  // TV remote control keyboard navigation
  useEffect(() => {
    if (!isTV) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          // Trigger action on focused button
          if (focusedButton === 'play') {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.getElementById('video-play-button')?.dispatchEvent(event);
          } else if (focusedButton === 'mute') {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.getElementById('video-mute-button')?.dispatchEvent(event);
          }
          break;
        
        // Handle directional navigation
        case 'ArrowRight':
          if (focusedButton === 'play') {
            setFocusedButton('forward');
          } else if (focusedButton === 'mute') {
            setFocusedButton('play');
          }
          e.preventDefault();
          break;
          
        case 'ArrowLeft':
          if (focusedButton === 'play') {
            setFocusedButton('mute');
          } else if (focusedButton === 'forward') {
            setFocusedButton('play');
          }
          e.preventDefault();
          break;
          
        // Space is often used as play/pause on TVs
        case ' ':
          onPlayPause(new MouseEvent('click') as any);
          e.preventDefault();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Set initial focus (usually on play/pause)
    setFocusedButton('play');
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTV, focusedButton, onPlayPause]);

  return (
    <>
      {/* Center play/pause button (visible on tap or hover) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 cursor-pointer pointer-events-none transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        <PlaybackControls.CenterPlayButton 
          isPlaying={isPlaying} 
          isFocused={focusedButton === 'play' && isTV}
        />
      </div>
      
      {/* Footer controls */}
      <div 
        className={`p-5 flex flex-col justify-end items-stretch bg-gradient-to-t from-black/90 via-black/70 to-transparent absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress bar (non-functional but adds to the UI) */}
        <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden hover:h-2.5 transition-all cursor-pointer group">
          <div className="w-[30%] h-full bg-primary rounded-full relative group-hover:shadow-lg">
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-primary shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex justify-between items-center">
          {/* Left controls: volume */}
          <VolumeControls 
            isMuted={isMuted}
            currentVolume={currentVolume}
            onMuteToggle={onMuteToggle}
            onVolumeChange={onVolumeChange}
            isTV={isTV}
            isFocused={focusedButton === 'mute'}
          />
          
          {/* Center controls: rewind, play, fast-forward */}
          <PlaybackControls 
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            isTV={isTV}
            focusedButton={focusedButton}
          />
          
          {/* Right controls: reload, settings, fullscreen */}
          <SettingsControls 
            isFullscreen={isFullscreen}
            onFullscreenToggle={onFullscreenToggle}
            onReload={onReload}
            isTV={isTV}
            focusedButton={focusedButton}
          />
        </div>
      </div>
      
      {/* Backdrop for mobile controls - to ensure they don't disappear when touching */}
      <div 
        className={`fixed inset-0 bg-transparent z-0 ${show ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={onClick}
      />
      
      {/* TV Remote Helper UI (only shown on TV devices) */}
      {isTV && show && <TVRemoteHelp />}
    </>
  );
};

export default VideoControls;
