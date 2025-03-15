
import { channels, countries, categories } from '../dataStore';
import { REMOTE_CONFIG, STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { updateLastSyncTime } from './config';
import { validateRemoteData } from './remoteValidation';
import { updateRemoteConfigLastSync } from './remote';

/**
 * Synchronize with remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: ${remoteUrl}`);
    setIsSyncing(true);
    
    // إضافة معلمات لتجنب التخزين المؤقت
    const cacheParam = `nocache=${Date.now()}&_=${Math.random().toString(36).substring(2, 15)}`;
    const urlWithCache = remoteUrl.includes('?') 
      ? `${remoteUrl}&${cacheParam}` 
      : `${remoteUrl}?${cacheParam}`;
    
    console.log(`جاري تحميل البيانات من: ${urlWithCache}`);
    const response = await fetch(urlWithCache, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`فشل في تحميل البيانات: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // التحقق من صحة البيانات
    if (!validateRemoteData(data)) {
      throw new Error('البيانات المستلمة غير صالحة');
    }
    
    // تحديث البيانات في الذاكرة
    if (Array.isArray(data.channels)) {
      console.log(`تم استلام ${data.channels.length} قناة من المصدر الخارجي`);
      
      // حفظ القنوات الحالية للرجوع إليها في حالة الخطأ
      const previousChannels = [...channels];
      
      try {
        // مسح القنوات الحالية وإضافة القنوات الجديدة
        channels.length = 0;
        channels.push(...data.channels);
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(data.channels));
        console.log(`تم تحديث ${channels.length} قناة بنجاح`);
      } catch (channelError) {
        console.error('خطأ في تحديث القنوات:', channelError);
        // استعادة القنوات السابقة في حالة الخطأ
        channels.length = 0;
        channels.push(...previousChannels);
        throw channelError;
      }
    }
    
    if (Array.isArray(data.countries)) {
      console.log(`تم استلام ${data.countries.length} دولة من المصدر الخارجي`);
      
      // حفظ الدول الحالية للرجوع إليها في حالة الخطأ
      const previousCountries = [...countries];
      
      try {
        // مسح الدول الحالية وإضافة الدول الجديدة
        countries.length = 0;
        countries.push(...data.countries);
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(data.countries));
        console.log(`تم تحديث ${countries.length} دولة بنجاح`);
      } catch (countryError) {
        console.error('خطأ في تحديث الدول:', countryError);
        // استعادة الدول السابقة في حالة الخطأ
        countries.length = 0;
        countries.push(...previousCountries);
        throw countryError;
      }
    }
    
    if (Array.isArray(data.categories)) {
      console.log(`تم استلام ${data.categories.length} فئة من المصدر الخارجي`);
      
      // حفظ الفئات الحالية للرجوع إليها في حالة الخطأ
      const previousCategories = [...categories];
      
      try {
        // مسح الفئات الحالية وإضافة الفئات الجديدة
        categories.length = 0;
        categories.push(...data.categories);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
        console.log(`تم تحديث ${categories.length} فئة بنجاح`);
      } catch (categoryError) {
        console.error('خطأ في تحديث الفئات:', categoryError);
        // استعادة الفئات السابقة في حالة الخطأ
        categories.length = 0;
        categories.push(...previousCategories);
        throw categoryError;
      }
    }
    
    // تحديث وقت آخر مزامنة
    updateLastSyncTime();
    updateRemoteConfigLastSync(remoteUrl);
    
    // وضع علامات إضافية للتحديث
    const timestamp = Date.now().toString();
    localStorage.setItem('channels_last_updated', timestamp);
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('nocache_version', timestamp);
    
    console.log('تمت المزامنة بنجاح مع المصدر الخارجي');
    
    // إطلاق حدث تحديث البيانات
    try {
      const event = new CustomEvent('data_updated', {
        detail: { source: 'remote', timestamp }
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('خطأ في إطلاق حدث التحديث:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// تنفيذ المزامنة مع Bladi Info
export const syncWithBladiInfo = async (forceRefresh = false): Promise<boolean> => {
  const urls = [
    'https://bladi-info.com/api/channels.json',
    'https://bladitv.lovable.app/api/channels.json'
  ];
  
  for (const url of urls) {
    try {
      console.log(`محاولة المزامنة مع ${url}`);
      const result = await syncWithRemoteSource(url, forceRefresh);
      if (result) {
        console.log(`تمت المزامنة بنجاح مع ${url}`);
        // حفظ الرابط الناجح للاستخدام المستقبلي
        const remoteConfig = {
          url,
          lastSync: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
        return true;
      }
    } catch (error) {
      console.error(`فشلت المزامنة مع ${url}:`, error);
    }
  }
  
  console.error('فشلت جميع محاولات المزامنة مع المصادر الخارجية');
  return false;
};
