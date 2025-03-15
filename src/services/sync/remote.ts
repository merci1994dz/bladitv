
import { STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { updateLastSyncTime } from './config';

// Functions for remote config management
export const getRemoteConfig = (): { url: string; lastSync: string } | null => {
  try {
    const remoteConfigStr = localStorage.getItem(STORAGE_KEYS.REMOTE_CONFIG);
    if (remoteConfigStr) {
      return JSON.parse(remoteConfigStr);
    }
    return null;
  } catch (error) {
    console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
    return null;
  }
};

export const setRemoteConfig = (url: string): void => {
  const remoteConfig = {
    url,
    lastSync: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
};

// Improved function to sync with remote source
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('جاري المزامنة مع المصدر الخارجي:', remoteUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout for larger files
    
    try {
      // Add cache-control headers and parameters to prevent caching
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Add random query parameter to bust cache
      const urlWithCacheBuster = remoteUrl.includes('?') 
        ? `${remoteUrl}&_=${Date.now()}&nocache=${Math.random()}`
        : `${remoteUrl}?_=${Date.now()}&nocache=${Math.random()}`;
      
      console.log('إرسال طلب إلى:', urlWithCacheBuster);
      
      const response = await fetch(urlWithCacheBuster, { 
        signal: controller.signal,
        cache: 'no-store', 
        headers,
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('خطأ في الاستجابة:', response.status, errorText);
        throw new Error(`فشل الاتصال بالمصدر الخارجي: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('النص المستلم:', responseText.substring(0, 150) + '...');
      
      let remoteData;
      try {
        remoteData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('خطأ في تحليل JSON:', parseError);
        console.log('النص المستلم غير صالح:', responseText.substring(0, 500));
        throw new Error('البيانات المستلمة ليست بتنسيق JSON صالح');
      }
      
      console.log('تم استلام البيانات:', {
        channels: remoteData.channels?.length || 0,
        countries: remoteData.countries?.length || 0,
        categories: remoteData.categories?.length || 0
      });
      
      // Data validation
      if (!remoteData || !remoteData.channels || !remoteData.countries || !remoteData.categories) {
        console.error('تنسيق البيانات غير صالح:', remoteData);
        throw new Error('تنسيق البيانات من المصدر الخارجي غير صالح');
      }
      
      // Ensure each channel has an ID
      remoteData.channels = remoteData.channels.map((channel: any) => {
        if (!channel.id) {
          channel.id = 'ch_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        }
        return channel;
      });
      
      // For forced refresh, we completely replace the data
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(remoteData.channels));
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(remoteData.countries));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteData.categories));
      
      // Save last updated timestamps for each data type
      localStorage.setItem('channels_updated_at', new Date().toISOString());
      localStorage.setItem('countries_updated_at', new Date().toISOString());
      localStorage.setItem('categories_updated_at', new Date().toISOString());
      
      // Update last sync time
      const lastSyncTime = updateLastSyncTime();
      
      // Update stored config
      const remoteConfig = {
        url: remoteUrl.split('?')[0], // Store the clean URL without parameters
        lastSync: lastSyncTime
      };
      localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
      
      console.log('تم تحديث البيانات بنجاح من المصدر الخارجي');
      
      // إضافة علامة زمنية مميزة لإجبار جميع المستخدمين على رؤية البيانات الجديدة
      localStorage.setItem('force_data_refresh', Date.now().toString());
      
      // Force page reload in cases of significant data changes (for admin actions)
      if (forceRefresh) {
        console.log('سيتم إعادة تحميل الصفحة لتطبيق التغييرات...');
        
        // نؤخر إعادة تحميل الصفحة قليلاً لإتاحة الوقت لعرض رسالة النجاح
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      return true;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('انتهت المهلة الزمنية للاتصال بالمصدر الخارجي');
      }
      console.error('خطأ في الاتصال:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('خطأ في تحديث البيانات من المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// New function to validate JSON from bladi-info.com
export const validateRemoteData = (data: any): boolean => {
  if (!data) return false;
  
  if (!Array.isArray(data.channels)) {
    console.error('بيانات القنوات غير صالحة - يجب أن تكون مصفوفة');
    return false;
  }
  
  if (!Array.isArray(data.countries)) {
    console.error('بيانات الدول غير صالحة - يجب أن تكون مصفوفة');
    return false;
  }
  
  if (!Array.isArray(data.categories)) {
    console.error('بيانات الفئات غير صالحة - يجب أن تكون مصفوفة');
    return false;
  }
  
  // Validate that each channel has required fields
  for (const channel of data.channels) {
    if (!channel.name || !channel.streamUrl) {
      console.error('قناة غير صالحة:', channel);
      return false;
    }
  }
  
  return true;
};

// دالة جديدة للاستيراد المباشر من bladi-info.com
export const importDirectlyFromBladiInfo = async (): Promise<boolean> => {
  try {
    setIsSyncing(true);
    const url = `https://bladi-info.com/api/channels.json?_=${Date.now()}&direct=true`;
    
    console.log('استيراد مباشر من bladi-info.com:', url);
    
    // استدعاء دالة المزامنة مع إجبار التحديث
    return await syncWithRemoteSource(url, true);
  } catch (error) {
    console.error('خطأ في الاستيراد المباشر من bladi-info.com:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};
