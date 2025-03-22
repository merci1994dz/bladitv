
/**
 * Core functionality for syncing with a remote source
 * وظائف أساسية للمزامنة مع مصدر بعيد
 */

import { setIsSyncing } from '../../../dataStore';
import { fetchRemoteData, isRemoteUrlAccessible } from '../fetch';
import { storeRemoteData } from '../storeData';
import { setSyncActive } from '../../status';
import { CORS_PROXIES } from './sources';

/**
 * Synchronize with a specific remote source
 * المزامنة مع مصدر بعيد محدد
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: / Syncing with remote source: ${remoteUrl}`);
    
    // إلغاء المنطق المتعلق بالتحديث الإجباري حسب طلب المستخدم
    
    // تعيين حالة المزامنة كنشطة
    // Set sync state as active
    setSyncActive(true);
    
    // تحقق مما إذا كان الرابط مصدرًا محليًا (يبدأ بـ /)
    // Check if the link is a local source (starts with /)
    const isLocalSource = remoteUrl.startsWith('/');
    
    // تجاوز المصادر المحلية إذا لم تكن ضرورية حسب طلب المستخدم
    if (isLocalSource) {
      console.log('تجاوز المصدر المحلي حسب طلب المستخدم');
      setSyncActive(false);
      return false;
    }
    
    // فحص إمكانية الوصول للرابط أولاً (لغير المصادر المحلية)
    // Check URL accessibility first (for non-local sources)
    if (!isLocalSource) {
      try {
        const isAccessible = await isRemoteUrlAccessible(remoteUrl);
        if (!isAccessible) {
          console.warn(`تعذر الوصول مباشرة إلى المصدر الخارجي: / Could not directly access remote source: ${remoteUrl}`);
          
          // محاولة استخدام CORS Proxy إذا فشل الوصول المباشر
          let proxySuccess = false;
          for (const proxy of CORS_PROXIES) {
            try {
              const proxyUrl = `${proxy}${encodeURIComponent(remoteUrl)}`;
              console.log(`محاولة استخدام بروكسي CORS: ${proxyUrl}`);
              
              const isProxyAccessible = await isRemoteUrlAccessible(proxyUrl);
              if (isProxyAccessible) {
                console.log(`نجاح الوصول عبر بروكسي CORS: ${proxyUrl}`);
                
                // استخدام عنوان البروكسي للمزامنة
                setIsSyncing(true);
                const data = await fetchRemoteData(proxyUrl);
                proxySuccess = await storeRemoteData(data, remoteUrl);
                
                if (proxySuccess) {
                  console.log(`تمت المزامنة بنجاح عبر بروكسي CORS مع ${remoteUrl}`);
                  setSyncActive(false);
                  setIsSyncing(false);
                  return true;
                }
                
                break;
              }
            } catch (proxyError) {
              console.warn(`فشل استخدام بروكسي CORS ${proxy}:`, proxyError);
            }
          }
          
          if (!proxySuccess) {
            // إذا فشلت جميع محاولات البروكسي، حاول مرة أخرى مباشرة
            console.log(`محاولة أخيرة للوصول المباشر إلى ${remoteUrl}`);
          } else {
            return true;
          }
        }
      } catch (accessError) {
        console.warn(`خطأ أثناء فحص إمكانية الوصول إلى / Error checking accessibility of ${remoteUrl}:`, accessError);
        // نستمر على أي حال، لنحاول تحميل البيانات
        // Continue anyway, try loading data
      }
    }
    
    setIsSyncing(true);
    
    // تعديل الرابط لمنع التخزين المؤقت بشكل مكثف
    // Modify the URL to aggressively prevent caching
    let urlWithCacheBuster = remoteUrl;
    if (!remoteUrl.includes('nocache=') && !remoteUrl.includes('_=')) {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const uniqueVisitorId = `visitor_${localStorage.getItem('visitor_id') || timestamp}_${Math.random().toString(36).substring(2, 15)}`;
      const requestTime = new Date().toISOString();
      
      const cacheBuster = `nocache=${timestamp}&_=${randomId}&visitorId=${uniqueVisitorId}&requestedAt=${encodeURIComponent(requestTime)}`;
      urlWithCacheBuster = remoteUrl.includes('?') 
        ? `${remoteUrl}&${cacheBuster}` 
        : `${remoteUrl}?${cacheBuster}`;
    }
    
    // إضافة محاولات متعددة لتحميل البيانات (حتى 5 محاولات)
    // Add multiple attempts to load data (up to 5 attempts)
    let attempts = 0;
    const maxAttempts = 5;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        console.log(`محاولة تحميل البيانات / Attempting to load data ${attempts}/${maxAttempts} from ${urlWithCacheBuster}`);
        
        const data = await fetchRemoteData(urlWithCacheBuster);
        success = await storeRemoteData(data, remoteUrl);
        
        if (success) {
          console.log(`تمت المزامنة بنجاح مع / Successfully synced with ${remoteUrl} after ${attempts} attempt(s)`);
          
          // إضافة علامات تحديث إجباري
          try {
            localStorage.setItem('force_browser_refresh', 'true');
            localStorage.setItem('nocache_version', Date.now().toString());
            localStorage.setItem('data_version', Date.now().toString());
            localStorage.setItem('last_successful_sync', Date.now().toString());
            localStorage.setItem('last_successful_source', remoteUrl);
          } catch (e) {
            console.error('فشل في تعيين علامات التحديث', e);
          }
          
          return true;
        }
      } catch (attemptError) {
        console.error(`فشلت المحاولة / Failed attempt ${attempts}/${maxAttempts} to sync data from ${urlWithCacheBuster}:`, attemptError);
        
        if (attempts < maxAttempts) {
          // الانتظار قبل المحاولة التالية مع زيادة الوقت في كل مرة
          // Wait before next attempt with increased time each time
          const waitTime = 1500 * attempts; // تقليل وقت الانتظار من 2000 إلى 1500
          console.log(`الانتظار / Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // تحديث معلمات منع التخزين المؤقت لكل محاولة
          const newTimestamp = Date.now();
          const newRandomId = Math.random().toString(36).substring(2, 15);
          const newCacheBuster = `nocache=${newTimestamp}&_=${newRandomId}`;
          
          // تغيير أسلوب إضافة معلمات منع التخزين المؤقت
          // طريقة أكثر قوة للتعامل مع الروابط المختلفة
          const baseUrl = remoteUrl.split('?')[0];
          const existingParams = remoteUrl.includes('?') 
            ? remoteUrl.split('?')[1].split('&')
            : [];
          
          // تصفية المعلمات القديمة المتعلقة بمنع التخزين المؤقت
          const filteredParams = existingParams.filter(param => 
            !param.startsWith('nocache=') && 
            !param.startsWith('_=') && 
            !param.startsWith('ts=') && 
            !param.startsWith('r=')
          );
          
          // إضافة معلمات جديدة
          const additionalParams = [
            `nocache=${newTimestamp}`,
            `_=${newRandomId}`,
            `ts=${newTimestamp}`,
            `r=${Math.random().toString(36).substring(2, 15)}`,
            `v=${newTimestamp}`,
            `d=${newTimestamp}`,
            `rand=${Math.random().toString(36).substring(2, 15)}`,
            `timestamp=${new Date().toISOString()}`
          ];
          
          // دمج جميع المعلمات
          const allParams = [...filteredParams, ...additionalParams];
          
          // بناء الرابط النهائي
          urlWithCacheBuster = `${baseUrl}?${allParams.join('&')}`;
        }
      }
    }
    
    if (!success) {
      console.error(`فشلت جميع محاولات المزامنة مع / All sync attempts failed with ${remoteUrl}`);
    }
    
    return success;
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي: / Error syncing with remote source:', error);
    return false;
  } finally {
    setIsSyncing(false);
    setSyncActive(false);
  }
};
