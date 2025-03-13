
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
  const [progressValue, setProgressValue] = useState<number>(0);
  
  // زيادة قيمة شريط التقدم التجريبي لإظهار التقدم
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressValue(prev => {
          const newValue = prev + 0.1;
          return newValue > 100 ? 0 : newValue;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);
  
  // تحكم جهاز التلفزيون عن بعد بلوحة المفاتيح
  useEffect(() => {
    if (!isTV) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          // تنفيذ إجراء على الزر المحدد
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
          } else if (focusedButton === 'forward') {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.getElementById('video-forward-button')?.dispatchEvent(event);
          } else if (focusedButton === 'rewind') {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            document.getElementById('video-rewind-button')?.dispatchEvent(event);
          }
          break;
        
        // التنقل الاتجاهي
        case 'ArrowRight':
          if (focusedButton === null || focusedButton === 'mute') {
            setFocusedButton('play');
          } else if (focusedButton === 'play') {
            setFocusedButton('forward');
          }
          e.preventDefault();
          break;
          
        case 'ArrowLeft':
          if (focusedButton === null || focusedButton === 'forward') {
            setFocusedButton('play');
          } else if (focusedButton === 'play') {
            setFocusedButton('rewind');
          } else if (focusedButton === 'rewind') {
            setFocusedButton('mute');
          }
          e.preventDefault();
          break;
          
        // المسافة غالبًا ما تستخدم كتشغيل/إيقاف مؤقت على أجهزة التلفزيون
        case ' ':
          onPlayPause(new MouseEvent('click') as any);
          e.preventDefault();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // تعيين التركيز الأولي (عادة على تشغيل/إيقاف مؤقت)
    setFocusedButton('play');
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTV, focusedButton, onPlayPause]);

  return (
    <>
      {/* زر تشغيل/إيقاف مؤقت في الوسط (مرئي عند النقر أو التحويم) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 cursor-pointer pointer-events-none transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        <PlaybackControls.CenterPlayButton 
          isPlaying={isPlaying} 
          isFocused={focusedButton === 'play' && isTV}
        />
      </div>
      
      {/* عناصر التحكم في التذييل */}
      <div 
        className={`p-5 flex flex-col justify-end items-stretch bg-gradient-to-t from-black/90 via-black/70 to-transparent absolute bottom-0 left-0 right-0 z-10 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* شريط التقدم (غير وظيفي لكنه يضيف إلى واجهة المستخدم) */}
        <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden hover:h-2.5 transition-all cursor-pointer group">
          <div 
            className="h-full bg-primary rounded-full relative group-hover:shadow-lg transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-primary shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
          </div>
        </div>
        
        {/* أزرار التحكم */}
        <div className="flex justify-between items-center">
          {/* عناصر التحكم اليسرى: مستوى الصوت */}
          <VolumeControls 
            isMuted={isMuted}
            currentVolume={currentVolume}
            onMuteToggle={onMuteToggle}
            onVolumeChange={onVolumeChange}
            isTV={isTV}
            isFocused={focusedButton === 'mute'}
          />
          
          {/* عناصر التحكم في المنتصف: رجوع، تشغيل، تقديم سريع */}
          <PlaybackControls 
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            isTV={isTV}
            focusedButton={focusedButton}
          />
          
          {/* عناصر التحكم اليمنى: إعادة تحميل، إعدادات، ملء الشاشة */}
          <SettingsControls 
            isFullscreen={isFullscreen}
            onFullscreenToggle={onFullscreenToggle}
            onReload={onReload}
            isTV={isTV}
            focusedButton={focusedButton}
          />
        </div>
      </div>
      
      {/* خلفية لعناصر التحكم المحمولة - للتأكد من أنها لا تختفي عند اللمس */}
      <div 
        className={`fixed inset-0 bg-transparent z-0 ${show ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={onClick}
      />
      
      {/* واجهة مساعدة جهاز التحكم عن بعد للتلفزيون (تظهر فقط على أجهزة التلفزيون) */}
      {isTV && show && <TVRemoteHelp />}
    </>
  );
};

export default VideoControls;
