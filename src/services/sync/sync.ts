
import { syncWithBladiInfo } from './remoteSync';
import { forceDataRefresh } from './forceRefresh';
import { syncAllData } from './coreSync';
import { publishChannelsToAllUsers } from './publishOperations';
import { useToast } from '@/hooks/use-toast';
import { getLastSyncTime } from './local';

// هذا الملف هو واجهة مبسطة للمزامنة يمكن استخدامها في واجهة المستخدم

// مزامنة القنوات مع مصادر أخرى
export const syncChannels = async (forceSync = false): Promise<boolean> => {
  try {
    console.log('بدء مزامنة القنوات...');
    
    // محاولة المزامنة مع مواقع Bladi Info
    const bladiResult = await syncWithBladiInfo(forceSync);
    
    if (bladiResult) {
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

// Hook مساعد للمزامنة يمكن استخدامه في المكونات
export const useSyncHelper = () => {
  const { toast } = useToast();
  
  // مزامنة القنوات مع إشعار
  const syncChannelsWithToast = async (forceSync = false) => {
    toast({
      title: "جاري المزامنة",
      description: "جاري تحديث القنوات من المصادر الخارجية..."
    });
    
    try {
      const result = await syncChannels(forceSync);
      
      if (result) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث القنوات بنجاح"
        });
        return true;
      } else {
        toast({
          title: "تعذرت المزامنة",
          description: "لم يتم العثور على تحديثات جديدة",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("خطأ في المزامنة:", error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر الاتصال بمصادر البيانات الخارجية",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // تحديث إجباري مع إشعار
  const forceUpdateWithToast = async () => {
    toast({
      title: "جاري التحديث الإجباري",
      description: "جاري تحديث ونشر القنوات لجميع المستخدمين..."
    });
    
    try {
      const result = await forceUpdateChannels();
      
      if (result) {
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث ونشر القنوات لجميع المستخدمين"
        });
        return true;
      } else {
        toast({
          title: "تعذر التحديث",
          description: "حدث خطأ أثناء تحديث ونشر القنوات",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("خطأ في التحديث الإجباري:", error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ غير متوقع أثناء تحديث القنوات",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // الحصول على معلومات آخر مزامنة
  const getSyncInfo = () => {
    const lastSync = getLastSyncTime();
    const lastSyncDate = lastSync ? new Date(lastSync) : null;
    const formattedDate = lastSyncDate 
      ? lastSyncDate.toLocaleString() 
      : 'لم تتم المزامنة بعد';
    
    return {
      lastSync,
      lastSyncDate,
      formattedDate
    };
  };
  
  return {
    syncChannels: syncChannelsWithToast,
    forceUpdate: forceUpdateWithToast,
    getSyncInfo
  };
};
