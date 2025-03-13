
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Maximize, Minimize, RefreshCw } from 'lucide-react';
import ExternalStreamingButton from './ExternalStreamingButton';
import { Channel } from '@/types';

interface SettingsControlsProps {
  isFullscreen: boolean;
  onFullscreenToggle: (e: React.MouseEvent) => void;
  onReload?: (e: React.MouseEvent) => void;
  isTV?: boolean;
  focusedButton: string | null;
  channel?: Channel; // إضافة القناة لدعم خدمات البث الخارجية
}

const SettingsControls: React.FC<SettingsControlsProps> = ({
  isFullscreen,
  onFullscreenToggle,
  onReload,
  isTV = false,
  focusedButton,
  channel
}) => {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      {onReload && (
        <Button 
          id="video-reload-button"
          variant="ghost" 
          size="icon"
          className={`rounded-full text-white hover:bg-white/20 h-9 w-9 backdrop-blur-sm ${focusedButton === 'reload' && isTV ? 'ring-2 ring-primary' : ''}`}
          onClick={onReload}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
      
      {channel && channel.externalLinks && channel.externalLinks.length > 0 && (
        <ExternalStreamingButton 
          channel={channel}
          isTV={isTV}
          isFocused={focusedButton === 'external'}
        />
      )}
      
      <Button 
        id="video-settings-button"
        variant="ghost" 
        size="icon"
        className={`rounded-full text-white hover:bg-white/20 h-9 w-9 hidden md:flex backdrop-blur-sm ${focusedButton === 'settings' && isTV ? 'ring-2 ring-primary' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Settings className="w-4 h-4" />
      </Button>
      
      <Button 
        id="video-fullscreen-button"
        variant="ghost" 
        size="icon"
        className={`rounded-full text-white hover:bg-white/20 h-10 w-10 backdrop-blur-sm ${focusedButton === 'fullscreen' && isTV ? 'ring-2 ring-primary' : ''}`}
        onClick={onFullscreenToggle}
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </Button>
    </div>
  );
};

export default SettingsControls;
