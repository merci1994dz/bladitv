
import { syncWithBladiInfo } from './remoteSync';
import { forceDataRefresh } from './forceRefresh';
import { syncAllData } from './core/syncOperations';
import { publishChannelsToAllUsers } from './publish';
import { useToast } from '@/hooks/use-toast';
import { getLastSyncTime } from './status/timestamp';

// هذا الملف هو واجهة مبسطة للمزامنة يمكن استخدامها في واجهة المستخدم

// مزامنة القنوات مع مصادر أخرى
export const syncChannels = async (forceSync = false): Promise<boolean> => {
  try {
    console.log('بدء مزامنة القنوات...');
    
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
