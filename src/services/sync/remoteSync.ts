
import { channels, countries, categories } from '../dataStore';
import { REMOTE_CONFIG, STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { updateLastSyncTime } from './config';
import { validateRemoteData } from './remoteValidation';
import { updateRemoteConfigLastSync } from './remote';

/**
 * Synchronize with remote source - محسنة للتعامل مع أخطاء الشبكة والمهل الزمنية
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
    
    // إضافة حماية التزامن Vercel Skew Protection
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // إضافة رأس معرف النشر إذا كانت حماية التزامن مُفعلة
    if (typeof window !== 'undefined' && window.ENV && window.ENV.VERCEL_SKEW_PROTECTION_ENABLED === '1') {
      if (window.ENV.VERCEL_DEPLOYMENT_ID) {
        headers['x-deployment-id'] = window.ENV.VERCEL_DEPLOYMENT_ID;
        console.log('تم تفعيل حماية التزامن Vercel Skew Protection');
      }
    }
    
    // إضافة مهلة زمنية للطلب - تقليلها إلى 10 ثوانٍ
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      console.log(`جاري تحميل البيانات من: ${urlWithCache}`);
      const response = await fetch(urlWithCache, {
        method: 'GET',
        headers,
        cache: 'no-store',
        signal: controller.signal,
        mode: 'cors',     // إضافة وضع CORS
        credentials: 'omit' // تجنب إرسال الكوكيز
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`فشل في تحميل البيانات: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // التحقق من صحة البيانات
      if (!validateRemoteData(data)) {
        throw new Error('البيانات المستلمة غير صالحة');
      }
      
      // حفظ نسخة احتياطية من البيانات الحالية قبل تحديثها
      const backupData = {
        channels: [...channels],
        countries: [...countries],
        categories: [...categories]
      };
      
      try {
        // تحديث البيانات في الذاكرة
        if (Array.isArray(data.channels)) {
          console.log(`تم استلام ${data.channels.length} قناة من المصدر الخارجي`);
          
          // مسح القنوات الحالية وإضافة القنوات الجديدة
          channels.length = 0;
          channels.push(...data.channels);
          
          // حفظ في مخزن محلي
          try {
            localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(data.channels));
            console.log(`تم تحديث ${channels.length} قناة بنجاح`);
          } catch (storageError) {
            console.error('خطأ في تخزين القنوات محليًا:', storageError);
            
            // استرجاع البيانات الاحتياطية في حالة الفشل
            channels.length = 0;
            channels.push(...backupData.channels);
            throw storageError;
          }
        }
        
        if (Array.isArray(data.countries)) {
          console.log(`تم استلام ${data.countries.length} دولة من المصدر الخارجي`);
          
          // مسح الدول الحالية وإضافة الدول الجديدة
          countries.length = 0;
          countries.push(...data.countries);
          
          try {
            localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(data.countries));
            console.log(`تم تحديث ${countries.length} دولة بنجاح`);
          } catch (storageError) {
            console.error('خطأ في تخزين الدول محليًا:', storageError);
            
            // استرجاع البيانات الاحتياطية في حالة الفشل
            countries.length = 0;
            countries.push(...backupData.countries);
            throw storageError;
          }
        }
        
        if (Array.isArray(data.categories)) {
          console.log(`تم استلام ${data.categories.length} فئة من المصدر الخارجي`);
          
          // مسح الفئات الحالية وإضافة الفئات الجديدة
          categories.length = 0;
          categories.push(...data.categories);
          
          try {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
            console.log(`تم تحديث ${categories.length} فئة بنجاح`);
          } catch (storageError) {
            console.error('خطأ في تخزين الفئات محليًا:', storageError);
            
            // استرجاع البيانات الاحتياطية في حالة الفشل
            categories.length = 0;
            categories.push(...backupData.categories);
            throw storageError;
          }
        }
        
        // تحديث وقت آخر مزامنة
        updateLastSyncTime();
        updateRemoteConfigLastSync(remoteUrl);
        
        // وضع علامات إضافية للتحديث
        const timestamp = Date.now().toString();
        try {
          localStorage.setItem('channels_last_updated', timestamp);
          localStorage.setItem('bladi_info_update', timestamp);
          localStorage.setItem('force_refresh', 'true');
          localStorage.setItem('nocache_version', timestamp);
        } catch (e) {
          console.error('خطأ في تخزين بيانات الطابع الزمني:', e);
        }
        
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
      } catch (updateError) {
        console.error('خطأ في تحديث البيانات:', updateError);
        
        // استعادة البيانات الاحتياطية في حالة الفشل
        channels.length = 0;
        countries.length = 0;
        categories.length = 0;
        
        channels.push(...backupData.channels);
        countries.push(...backupData.countries);
        categories.push(...backupData.categories);
        
        throw updateError;
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('تم إلغاء طلب المزامنة بسبب تجاوز المهلة الزمنية');
      } else {
        console.error('خطأ في جلب البيانات:', fetchError);
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// تنفيذ المزامنة مع Bladi Info - مع تحسين إدارة الأخطاء
export const syncWithBladiInfo = async (forceRefresh = false): Promise<boolean> => {
  const urls = [
    'https://bladitv.lovable.app/api/channels.json', // ترتيب المصادر المفضلة من الأفضل للأسوأ
    'https://bladi-info.com/api/channels.json'
  ];
  
  let lastError: Error | null = null;
  
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
        try {
          localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
        } catch (e) {
          console.error('خطأ في حفظ تكوين المصدر الخارجي:', e);
        }
        return true;
      }
    } catch (error) {
      console.error(`فشلت المزامنة مع ${url}:`, error);
      lastError = error as Error;
    }
  }
  
  console.error('فشلت جميع محاولات المزامنة مع المصادر الخارجية', lastError);
  return false;
};
