
/**
 * وظائف تخزين البيانات المستلمة من المصادر الخارجية
 * Functions for storing data received from external sources
 */

import { channels, countries, categories, setChannels, setCountries, setCategories } from '../../dataStore';
import { STORAGE_KEYS } from '../config';
import { Channel, Country, Category } from '@/types';

/**
 * تخزين البيانات المستلمة من المصدر الخارجي
 * Store data received from external source
 */
export const storeRemoteData = async (
  data: any,
  source: string,
  options?: { preventDuplicates?: boolean }
): Promise<void> => {
  try {
    const preventDuplicates = options?.preventDuplicates !== false; // افتراضيًا true
    
    // تحديث قنوات
    if (data.channels && Array.isArray(data.channels)) {
      let updatedChannels = [...channels];
      
      if (preventDuplicates) {
        // تجنب القنوات المكررة عن طريق معرفاتها
        const existingIds = new Set(channels.map(ch => ch.id));
        const newChannels = data.channels.filter((ch: Channel) => !existingIds.has(ch.id));
        
        // إضافة القنوات الجديدة فقط
        updatedChannels = [...channels, ...newChannels];
      } else {
        // استبدال جميع القنوات
        updatedChannels = [...data.channels];
      }
      
      // تحديث حالة المفضلة للقنوات
      updatedChannels = updatedChannels.map((newChannel: Channel) => {
        const existingChannel = channels.find(ch => ch.id === newChannel.id);
        
        if (existingChannel) {
          // الاحتفاظ بحالة المفضلة من القناة الموجودة
          return {
            ...newChannel,
            isFavorite: existingChannel.isFavorite
          };
        }
        
        return newChannel;
      });
      
      setChannels(updatedChannels);
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(updatedChannels));
    }
    
    // تحديث الدول
    if (data.countries && Array.isArray(data.countries)) {
      setCountries(data.countries);
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(data.countries));
    }
    
    // تحديث الفئات
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
    }
    
    // تخزين مصدر البيانات الناجح
    localStorage.setItem('last_successful_source', source);
    
  } catch (error) {
    console.error('خطأ في تخزين البيانات المستلمة:', error);
    throw error;
  }
};
