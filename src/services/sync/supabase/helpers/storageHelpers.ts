
/**
 * مساعدات لتحديث التخزين المحلي
 * Helpers for updating local storage
 */

import { STORAGE_KEYS } from '../../../config';
import { Channel, Country, Category } from '@/types';
import { SupabaseChannel, toChannel } from '@/services/supabase/types/channelTypes';

/**
 * تحديث مخازن البيانات المحلية بالبيانات المستلمة من Supabase
 * Update local data stores with data received from Supabase
 */
export const updateLocalStoreWithData = async (
  channelsData: any[] | null,
  countriesData: any[] | null,
  categoriesData: any[] | null,
  channels: Channel[],
  countries: Country[],
  categories: Category[]
): Promise<void> => {
  // حفظ البيانات الأصلية للحالات الطارئة
  const originalChannels = [...channels];
  const originalCountries = [...countries];
  const originalCategories = [...categories];
  
  try {
    // تحديث القنوات - مع منع التكرار
    if (channelsData && channelsData.length > 0) {
      console.log(`تم استلام ${channelsData.length} قناة من Supabase / Received ${channelsData.length} channels from Supabase`);
      
      // جمع معرفات وأسماء وروابط البث الموجودة حاليًا
      const existingIds = new Set(channels.map(ch => ch.id));
      const existingNames = new Set(channels.map(ch => ch.name.toLowerCase()));
      const existingUrls = new Set(channels.map(ch => ch.streamUrl));
      
      // تحويل بيانات Supabase إلى نموذج القناة
      const convertedChannels = (channelsData as SupabaseChannel[]).map(toChannel);
      
      // فلترة القنوات الجديدة فقط لتجنب التكرار
      let newChannels = convertedChannels.filter(ch => 
        !existingIds.has(ch.id) && 
        !existingNames.has(ch.name.toLowerCase()) && 
        !existingUrls.has(ch.streamUrl)
      );
      
      // إضافة القنوات الجديدة فقط
      if (newChannels.length > 0) {
        channels.push(...newChannels);
        console.log(`تم إضافة ${newChannels.length} قناة جديدة وتجاهل ${channelsData.length - newChannels.length} قناة متكررة`);
      } else {
        console.log(`تم تجاهل جميع القنوات المستلمة لأنها مكررة`);
      }
      
      try {
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      } catch (e) {
        console.warn('لم يتم حفظ القنوات في التخزين المحلي / Failed to save channels to local storage:', e);
      }
    } else {
      console.warn('لم يتم استلام أي قنوات من Supabase / No channels received from Supabase');
    }
    
    // تحديث البلدان - مع منع التكرار
    if (countriesData && countriesData.length > 0) {
      console.log(`تم استلام ${countriesData.length} بلد من Supabase / Received ${countriesData.length} countries from Supabase`);
      
      // جمع معرفات وأسماء البلدان الموجودة حاليًا
      const existingIds = new Set(countries.map(c => c.id));
      const existingNames = new Set(countries.map(c => c.name.toLowerCase()));
      
      // فلترة البلدان الجديدة فقط
      const newCountries = (countriesData as Country[]).filter(country => 
        !existingIds.has(country.id) && 
        !existingNames.has(country.name.toLowerCase())
      );
      
      // إضافة البلدان الجديدة فقط
      if (newCountries.length > 0) {
        countries.push(...newCountries);
        console.log(`تم إضافة ${newCountries.length} بلد جديد وتجاهل ${countriesData.length - newCountries.length} بلد متكرر`);
      } else {
        console.log(`تم تجاهل جميع البلدان المستلمة لأنها مكررة`);
      }
      
      try {
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
      } catch (e) {
        console.warn('لم يتم حفظ البلدان في التخزين المحلي / Failed to save countries to local storage:', e);
      }
    } else {
      console.warn('لم يتم استلام أي بلدان من Supabase / No countries received from Supabase');
    }
    
    // تحديث الفئات - مع منع التكرار
    if (categoriesData && categoriesData.length > 0) {
      console.log(`تم استلام ${categoriesData.length} فئة من Supabase / Received ${categoriesData.length} categories from Supabase`);
      
      // جمع معرفات وأسماء الفئات الموجودة حاليًا
      const existingIds = new Set(categories.map(c => c.id));
      const existingNames = new Set(categories.map(c => c.name.toLowerCase()));
      
      // فلترة الفئات الجديدة فقط
      const newCategories = (categoriesData as Category[]).filter(category => 
        !existingIds.has(category.id) && 
        !existingNames.has(category.name.toLowerCase())
      );
      
      // إضافة الفئات الجديدة فقط
      if (newCategories.length > 0) {
        categories.push(...newCategories);
        console.log(`تم إضافة ${newCategories.length} فئة جديدة وتجاهل ${categoriesData.length - newCategories.length} فئة متكررة`);
      } else {
        console.log(`تم تجاهل جميع الفئات المستلمة لأنها مكررة`);
      }
      
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      } catch (e) {
        console.warn('لم يتم حفظ الفئات في التخزين المحلي / Failed to save categories to local storage:', e);
      }
    } else {
      console.warn('لم يتم استلام أي فئات من Supabase / No categories received from Supabase');
    }
  } catch (error) {
    console.error('خطأ أثناء تحديث البيانات المحلية:', error);
    
    // استعادة البيانات الأصلية في حالة الفشل
    channels.length = 0;
    countries.length = 0;
    categories.length = 0;
    
    channels.push(...originalChannels);
    countries.push(...originalCountries);
    categories.push(...originalCategories);
    
    throw error;
  }
};
