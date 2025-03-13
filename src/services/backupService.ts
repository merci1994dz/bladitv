
import { STORAGE_KEYS } from './config';
import { channels, countries, categories } from './dataStore';
import { syncAllData, getLastSyncTime } from './sync';
import { toast } from '@/hooks/use-toast';

interface BackupData {
  channels: any[];
  countries: any[];
  categories: any[];
  lastSyncTime: string;
  version: string;
  createdAt: string;
}

// إنشاء نسخة احتياطية من البيانات
export const createBackup = (): BackupData => {
  // جمع البيانات من التخزين المحلي
  const channelsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHANNELS) || '[]');
  const countriesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUNTRIES) || '[]');
  const categoriesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  const lastSyncTime = getLastSyncTime() || new Date().toISOString();
  
  // إنشاء كائن النسخة الاحتياطية
  const backupData: BackupData = {
    channels: channelsData,
    countries: countriesData,
    categories: categoriesData,
    lastSyncTime: lastSyncTime || new Date().toISOString(),
    version: '1.0',
    createdAt: new Date().toISOString()
  };
  
  return backupData;
};

// تصدير النسخة الاحتياطية كملف
export const exportBackup = (): void => {
  try {
    const backupData = createBackup();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    // إنشاء رابط تنزيل وتنفيذه
    const exportFileDefaultName = `tv-app-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "تم إنشاء النسخة الاحتياطية",
      description: "تم تصدير البيانات بنجاح"
    });
  } catch (error) {
    console.error('خطأ أثناء تصدير النسخة الاحتياطية:', error);
    toast({
      title: "فشل إنشاء النسخة الاحتياطية",
      description: "حدث خطأ أثناء تصدير البيانات",
      variant: "destructive"
    });
  }
};

// استيراد النسخة الاحتياطية من ملف
export const importBackup = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("فشل قراءة الملف");
        }
        
        const backupData: BackupData = JSON.parse(event.target.result as string);
        
        // التحقق من صحة البيانات
        if (!backupData.channels || !backupData.countries || !backupData.categories) {
          throw new Error("تنسيق ملف النسخة الاحتياطية غير صالح");
        }
        
        // تخزين البيانات في التخزين المحلي
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(backupData.channels));
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(backupData.countries));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(backupData.categories));
        
        if (backupData.lastSyncTime) {
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, backupData.lastSyncTime);
          if (STORAGE_KEYS.LAST_SYNC) {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, backupData.lastSyncTime);
          }
        }
        
        // تحديث البيانات في الذاكرة
        syncAllData()
          .then(() => {
            toast({
              title: "تم استعادة النسخة الاحتياطية",
              description: "تم استيراد البيانات بنجاح"
            });
            resolve(true);
          })
          .catch((error) => {
            console.error('خطأ أثناء مزامنة البيانات بعد الاستعادة:', error);
            reject(error);
          });
      } catch (error) {
        console.error('خطأ أثناء استيراد النسخة الاحتياطية:', error);
        toast({
          title: "فشل استعادة النسخة الاحتياطية",
          description: "تنسيق الملف غير صالح أو البيانات تالفة",
          variant: "destructive"
        });
        reject(error);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "فشل قراءة الملف",
        description: "حدث خطأ أثناء قراءة ملف النسخة الاحتياطية",
        variant: "destructive"
      });
      reject(new Error("خطأ في قراءة الملف"));
    };
    
    reader.readAsText(file);
  });
};
