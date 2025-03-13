
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export function useVideoFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;

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
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.error('Error exiting fullscreen:', e));
      }
    };
  }, []);

  return {
    isFullscreen,
    toggleFullscreen
  };
}
