
import { syncWithBladiInfo } from './remoteSync';
import { forceDataRefresh } from './forceRefresh';
import { syncAllData } from './core/syncOperations';
import { publishChannelsToAllUsers } from './publish';
import { useToast } from '@/hooks/use-toast';
import { getLastSyncTime } from './status/timestamp';
import { checkConnectivityIssues } from './status/connectivity';

/**
 * هذا الملف هو واجهة مبسطة للمزامنة يمكن استخدامها في واجهة المستخدم
 * This file is a simplified interface for synchronization that can be used in the UI
 */

// مزامنة القنوات مع مصادر أخرى
// Sync channels with other sources
export const syncChannels = async (forceSync = false): Promise<boolean> => {
  try {
    console.log('بدء مزامنة القنوات...');
    
    // التحقق من وجود اتصال بالإنترنت قبل المحاولة
    const networkStatus = await checkConnectivityIssues();
    if (!networkStatus.hasInternet) {
      console.warn('تعذرت المزامنة: لا يوجد اتصال بالإنترنت');
      return false;
    }
    
    // محاولة المزامنة مع مواقع Bladi Info
    const bladiResult = await syncWithBladiInfo(forceSync);
    
    if (bladiResult.updated) {
      console.log('تمت المزامنة بنجاح مع مواقع Bladi Info');
      return true;
    }
    
    // إذا فشلت المزامنة مع مواقع Bladi، استخدم المزامنة العادية
    console.log('محاولة استخدام المزامنة الأساسية...');
    const syncResult = await syncAllData(forceSync);
    
    return syncResult;
  } catch (error) {
    console.error('خطأ في مزامنة القنوات:', error);
    return false;
  }
};

// تحديث القنوات بشكل إجباري مع إعادة تحميل البيانات
// Force update channels with data reload
export const forceUpdateChannels = async (): Promise<boolean> => {
  try {
    console.log('بدء التحديث الإجباري للقنوات...');
    
    // تنفيذ التحديث الإجباري
    await forceDataRefresh();
    
    // نشر التحديثات للمستخدمين
    await publishChannelsToAllUsers();
    
    return true;
  } catch (error) {
    console.error('خطأ في التحديث الإجباري للقنوات:', error);
    return false;
  }
};

/**
 * الحصول على حالة المزامنة الحالية
 * Get current sync status
 */
export const getSyncStatus = (): { 
  lastSync: string | null,
  isOnline: boolean
} => {
  const lastSync = getLastSyncTime();
  const isOnline = navigator.onLine;
  
  return {
    lastSync,
    isOnline
  };
};
