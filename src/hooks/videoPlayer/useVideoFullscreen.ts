
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export function useVideoFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTV, setIsTV] = useState(false);

  // Detect if device is TV on mount
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTVDevice = 
      userAgent.includes('tv') || 
      userAgent.includes('android tv') || 
      userAgent.includes('smart-tv') ||
      (window.innerWidth > 1280 && window.innerHeight < window.innerWidth);
    
    setIsTV(isTVDevice);
    
    // If it's a TV, we might want to default to fullscreen
    if (isTVDevice) {
      // Most TV apps run in fullscreen by default
      setIsFullscreen(true);
    }
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // On TV devices, we often don't need to toggle fullscreen as the app typically runs fullscreen
    if (isTV) {
      // We'll still update the state for UI consistency
      setIsFullscreen(!isFullscreen);
      return;
    }

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
        toast({
          title: "تنبيه",
          description: "تعذر تفعيل وضع ملء الشاشة.",
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      // Exit fullscreen on unmount if needed
      if (document.fullscreenElement && !isTV) {
        document.exitFullscreen().catch(e => console.error('Error exiting fullscreen:', e));
      }
    };
  }, [isTV]);

  return {
    isFullscreen,
    toggleFullscreen,
    isTV
  };
}
