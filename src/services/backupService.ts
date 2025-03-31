
import { channels, countries, categories } from './dataStore';
import { getLastSyncTime } from './sync/config';
import { syncData } from './sync';

// استيراد البيانات من ملف
export const importDataFromFile = async (file: File): Promise<boolean> => {
  try {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;
          const importedData = JSON.parse(fileContent);
          
          // التحقق من صحة البيانات
          if (!importedData.channels || !Array.isArray(importedData.channels)) {
            throw new Error('ملف غير صالح: لا يحتوي على بيانات القنوات');
          }
          
          // حفظ البيانات في التخزين المحلي
          localStorage.setItem('channels', JSON.stringify(importedData.channels));
          
          if (importedData.countries && Array.isArray(importedData.countries)) {
            localStorage.setItem('countries', JSON.stringify(importedData.countries));
          }
          
          if (importedData.categories && Array.isArray(importedData.categories)) {
            localStorage.setItem('categories', JSON.stringify(importedData.categories));
          }
          
          // تحديث الحالة في الذاكرة
          channels.length = 0;
          countries.length = 0;
          categories.length = 0;
          
          channels.push(...importedData.channels);
          
          if (importedData.countries) {
            countries.push(...importedData.countries);
          }
          
          if (importedData.categories) {
            categories.push(...importedData.categories);
          }
          
          // إطلاق حدث تحديث البيانات
          const event = new CustomEvent('app_data_updated', {
            detail: { source: 'import', timestamp: Date.now() }
          });
          window.dispatchEvent(event);
          
          resolve(true);
        } catch (error) {
          console.error('خطأ في معالجة ملف الاستيراد:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('فشل قراءة الملف'));
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('خطأ في استيراد البيانات من ملف:', error);
    return false;
  }
};

// تصدير البيانات إلى ملف
export const exportDataToFile = (): void => {
  try {
    // تجميع البيانات للتصدير
    const exportData = {
      channels,
      countries,
      categories,
      exportDate: new Date().toISOString(),
      lastSyncTime: getLastSyncTime()
    };
    
    // تحويل البيانات إلى سلسلة JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // إنشاء Blob و URL للتنزيل
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // إنشاء رابط تنزيل وهمي
    const link = document.createElement('a');
    link.href = url;
    link.download = `bladi_tv_export_${new Date().toISOString().split('T')[0]}.json`;
    
    // إضافة الرابط إلى المستند والنقر عليه وإزالته
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // تحرير URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('خطأ في تصدير البيانات إلى ملف:', error);
  }
};

// مزامنة البيانات مع الخوادم البعيدة
export const syncWithRemoteServers = async (): Promise<boolean> => {
  try {
    return await syncData(true);
  } catch (error) {
    console.error('خطأ في المزامنة مع الخوادم البعيدة:', error);
    return false;
  }
};

// استعادة البيانات الافتراضية
export const restoreDefaultData = async (): Promise<boolean> => {
  try {
    // مسح التخزين المحلي
    localStorage.removeItem('channels');
    localStorage.removeItem('countries');
    localStorage.removeItem('categories');
    
    // إعادة تعيين المصفوفات
    channels.length = 0;
    countries.length = 0;
    categories.length = 0;
    
    // محاولة المزامنة مع المصادر الافتراضية
    await syncData(true);
    
    // إطلاق حدث تحديث البيانات
    const event = new CustomEvent('app_data_updated', {
      detail: { source: 'restore_default', timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('خطأ في استعادة البيانات الافتراضية:', error);
    return false;
  }
};
