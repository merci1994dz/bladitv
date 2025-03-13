
import * as React from "react";
import { useIsMobile } from "./use-mobile";

// قائمة بوكلاء المستخدم المعروفين لأجهزة التلفزيون
const TV_USER_AGENTS = [
  'tv', 'android tv', 'smart-tv', 'hbbtv', 'netcast', 'viera', 'webos', 
  'tizen', 'vidaa', 'roku', 'toshiba', 'philips', 'panasonic', 'lg tv',
  'samsung', 'sony', 'mibox', 'firetv', 'appletv', 'googletv'
];

export function useIsTV() {
  const [isTV, setIsTV] = React.useState<boolean | undefined>(undefined);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) {
      setIsTV(false);
      return;
    }

    // 1. كشف أجهزة التلفزيون بناءً على وكيل المستخدم
    const userAgent = navigator.userAgent.toLowerCase();
    
    // فحص كل وكلاء المستخدمين المعروفين لأجهزة التلفزيون
    const isTVUserAgent = TV_USER_AGENTS.some(agent => userAgent.includes(agent));
    
    // 2. كشف بناءً على الأبعاد النموذجية للتلفزيون (شاشة كبيرة، منظر أفقي ثابت)
    const isLargeLandscapeScreen = 
      window.innerWidth > 1280 && 
      window.innerHeight < window.innerWidth * 0.8;
    
    // 3. فحص إضافي للأجهزة التي قد لا تعلن عن نفسها كتلفزيون
    const isSpecialTVDevice = detectSpecialTVPlatforms();
    
    // تعيين العلامة بناءً على النتائج المجمعة
    setIsTV(isTVUserAgent || (isLargeLandscapeScreen && !isMobile) || isSpecialTVDevice);
  }, [isMobile]);

  return !!isTV;
}

// كشف المنصات الخاصة
function detectSpecialTVPlatforms(): boolean {
  // كشف تلفزيونات Tizen (سامسونج)
  const hasTizen = (window as any).tizen !== undefined;
  
  // كشف منصة WebOS (LG)
  const hasWebOS = (window as any).webOS !== undefined;
  
  // كشف أجهزة FireTV
  const isFireTV = navigator.userAgent.toLowerCase().includes('aftn');
  
  // كشف Chromecast/GoogleTV
  const isChromecast = navigator.userAgent.toLowerCase().includes('crkey');
  
  // تحقق من وضع العرض العريض المستمر
  const isAlwaysLandscape = window.screen && 
    window.screen.orientation && 
    window.screen.orientation.type === 'landscape-primary' && 
    // Fix: check if window.screen.orientation has a 'locked' property before accessing it
    typeof window.screen.orientation.locked === 'boolean' ? 
      window.screen.orientation.locked : false;
  
  return hasTizen || hasWebOS || isFireTV || isChromecast || isAlwaysLandscape;
}

// هذا المكون يجمع بين كشف الأجهزة المحمولة وأجهزة التلفزيون للمساعدة في التصميمات المتجاوبة
export function useDeviceType() {
  const isMobile = useIsMobile();
  const isTV = useIsTV();
  
  return {
    isMobile,
    isTV,
    isDesktop: !isMobile && !isTV
  };
}
