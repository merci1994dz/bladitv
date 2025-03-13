
import { STORAGE_KEYS } from '../config';

// أنواع الإعدادات
interface UserSettings {
  interface: {
    theme: string;
    fontSize: number;
    cardSize: string;
    animationsEnabled: boolean;
  };
  playback: {
    autoplay: boolean;
    quality: string;
    volume: number;
    muteOnStart: boolean;
  };
  tv: {
    remoteNavigation: boolean;
    enhancedFocus: boolean;
    biggerUI: boolean;
  };
  sync: {
    enabled: boolean;
    lastSyncTime: string;
    deviceName: string;
  };
}

// الإعدادات الافتراضية
const defaultSettings: UserSettings = {
  interface: {
    theme: 'system',
    fontSize: 16,
    cardSize: 'medium',
    animationsEnabled: true
  },
  playback: {
    autoplay: true,
    quality: 'auto',
    volume: 0.7,
    muteOnStart: false
  },
  tv: {
    remoteNavigation: true,
    enhancedFocus: true,
    biggerUI: true
  },
  sync: {
    enabled: true,
    lastSyncTime: '',
    deviceName: `جهاز ${Math.floor(Math.random() * 1000)}`
  }
};

// جلب إعدادات المستخدم المحفوظة
export const getUserSettings = (): UserSettings => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('فشل في قراءة إعدادات المستخدم:', error);
  }
  
  return defaultSettings;
};

// حفظ إعدادات المستخدم
export const saveUserSettings = (settings: UserSettings): void => {
  try {
    // تحديث وقت آخر مزامنة
    const updatedSettings = {
      ...settings,
      sync: {
        ...settings.sync,
        lastSyncTime: new Date().toISOString()
      }
    };
    
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updatedSettings));
    
    // حدث لإخطار الكود الآخر بتغيير الإعدادات
    window.dispatchEvent(new CustomEvent('settings-updated', { 
      detail: updatedSettings 
    }));
  } catch (error) {
    console.error('فشل في حفظ إعدادات المستخدم:', error);
  }
};

// مزامنة الإعدادات مع خادم بعيد (تنفيذ وهمي)
export const syncSettingsWithRemote = async (): Promise<boolean> => {
  try {
    const settings = getUserSettings();
    
    // في تطبيق حقيقي، سنرسل الإعدادات إلى API
    console.log('مزامنة الإعدادات مع الخادم البعيد...', settings);
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // تحديث وقت آخر مزامنة
    saveUserSettings({
      ...settings,
      sync: {
        ...settings.sync,
        lastSyncTime: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('فشل في مزامنة الإعدادات:', error);
    return false;
  }
};

// استرداد الإعدادات من خادم بعيد (تنفيذ وهمي)
export const fetchRemoteSettings = async (): Promise<UserSettings | null> => {
  try {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // في تطبيق حقيقي، سنجلب الإعدادات من API
    // هنا نعيد الإعدادات المحلية كمحاكاة
    const localSettings = getUserSettings();
    
    console.log('تم جلب الإعدادات من الخادم البعيد', localSettings);
    
    return localSettings;
  } catch (error) {
    console.error('فشل في جلب الإعدادات البعيدة:', error);
    return null;
  }
};

// تطبيق الإعدادات على واجهة المستخدم
export const applyUserSettings = (settings: UserSettings): void => {
  try {
    // تطبيق السمة
    if (settings.interface.theme) {
      document.documentElement.classList.remove('light', 'dark');
      if (settings.interface.theme !== 'system') {
        document.documentElement.classList.add(settings.interface.theme);
      } else {
        // استخدام وضع النظام
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.add('light');
        }
      }
    }
    
    // تطبيق حجم الخط
    if (settings.interface.fontSize) {
      document.documentElement.style.fontSize = `${settings.interface.fontSize}px`;
    }
    
    // تطبيق إعدادات التلفزيون
    if (settings.tv.biggerUI) {
      document.documentElement.classList.add('tv-mode');
    } else {
      document.documentElement.classList.remove('tv-mode');
    }
    
    console.log('تم تطبيق إعدادات المستخدم', settings);
  } catch (error) {
    console.error('فشل في تطبيق إعدادات المستخدم:', error);
  }
};

// مراقبة تغييرات الإعدادات
export const setupSettingsListener = (): () => void => {
  const handleSettingsChange = (event: CustomEvent<UserSettings>) => {
    applyUserSettings(event.detail);
  };
  
  window.addEventListener('settings-updated', handleSettingsChange as EventListener);
  
  // تطبيق الإعدادات المحفوظة عند بدء التشغيل
  applyUserSettings(getUserSettings());
  
  // إزالة المستمع عند التنظيف
  return () => {
    window.removeEventListener('settings-updated', handleSettingsChange as EventListener);
  };
};
