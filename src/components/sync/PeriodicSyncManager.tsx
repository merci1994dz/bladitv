
import React, { useEffect } from 'react';

interface PeriodicSyncManagerProps {
  // Change the return type to accept NodeJS.Timeout
  setupPeriodicSync: () => NodeJS.Timeout;
  setupRealtimeSync: () => void;
  handleOnline: () => void;
  handleFocus: () => void;
}

/**
 * مكون يدير المزامنة الدورية ومراقبة اتصال الشبكة
 */
const PeriodicSyncManager: React.FC<PeriodicSyncManagerProps> = ({
  setupPeriodicSync,
  setupRealtimeSync,
  handleOnline,
  handleFocus,
}) => {
  useEffect(() => {
    // إعداد المزامنة الدورية
    const syncIntervalId = setupPeriodicSync();
    
    // إعداد الاشتراك في الوقت الحقيقي
    setupRealtimeSync();
    
    // إعداد مستمعي الشبكة
    window.addEventListener('online', handleOnline);
    
    // إعداد مستمعي التركيز/التشويش
    window.addEventListener('focus', handleFocus);
    
    // تنظيف جميع المستمعين والمؤقتات
    return () => {
      clearInterval(syncIntervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [setupPeriodicSync, setupRealtimeSync, handleOnline, handleFocus]);
  
  return null;
};

export default PeriodicSyncManager;
