
import * as React from "react";
import { useIsMobile } from "./use-mobile";

export function useIsTV() {
  const [isTV, setIsTV] = React.useState<boolean | undefined>(undefined);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    // TV detection methods:
    // 1. Check for common TV user agent strings
    // 2. Check for typical TV viewport dimensions (large, fixed landscape)
    // 3. Check if running on Android TV platform
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isTVUserAgent = 
      userAgent.includes('tv') || 
      userAgent.includes('android tv') || 
      userAgent.includes('smart-tv') || 
      userAgent.includes('hbbtv') ||
      userAgent.includes('netcast') ||
      userAgent.includes('viera') ||
      userAgent.includes('webos');
    
    // Most TVs have a landscape orientation with large dimensions
    const isLargeLandscapeScreen = 
      window.innerWidth > 1280 && 
      window.innerHeight < window.innerWidth;
    
    // Additional check for Android TV
    const isAndroidTV = 
      userAgent.includes('android') && 
      !userAgent.includes('mobile') && 
      (isLargeLandscapeScreen || isTVUserAgent);
    
    setIsTV(isAndroidTV || isTVUserAgent);
  }, [isMobile]);

  return !!isTV;
}

// This hook combines mobile and TV detection to help with responsive designs
export function useDeviceType() {
  const isMobile = useIsMobile();
  const isTV = useIsTV();
  
  return {
    isMobile,
    isTV,
    isDesktop: !isMobile && !isTV
  };
}
