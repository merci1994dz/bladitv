
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
  // تحديث القنوات مع منع التكرار
  // Update channels with duplication prevention
  if (channelsData && channelsData.length > 0) {
    console.log(`تم استلام ${channelsData.length} قناة من Supabase / Received ${channelsData.length} channels from Supabase`);
    
    // تحويل البيانات إلى قنوات
    const newChannels = (channelsData as SupabaseChannel[]).map(toChannel);
    
    // إنشاء مجموعة من معرفات القنوات الموجودة لتسريع البحث
    const existingIds = new Set(channels.map(c => c.id));
    
    // إنشاء مجموعة من أسماء القنوات الموجودة لمنع التكرار بالاسم
    const existingNames = new Set(channels.map(c => c.name.toLowerCase()));
    
    // إنشاء مجموعة من روابط البث الموجودة لمنع التكرار بالرابط
    const existingUrls = new Set(channels.map(c => c.streamUrl));
    
    // إضافة القنوات الجديدة فقط (غير المكررة)
    const uniqueNewChannels = newChannels.filter(newChannel => {
      // تحقق من عدم وجود المعرف أو الاسم أو الرابط في القنوات الحالية
      return !existingIds.has(newChannel.id) && 
             !existingNames.has(newChannel.name.toLowerCase()) && 
             !existingUrls.has(newChannel.streamUrl);
    });
    
    if (uniqueNewChannels.length > 0) {
      console.log(`إضافة ${uniqueNewChannels.length} قناة جديدة غير مكررة / Adding ${uniqueNewChannels.length} new unique channels`);
      channels.push(...uniqueNewChannels);
      
      try {
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      } catch (e) {
        console.warn('لم يتم حفظ القنوات في التخزين المحلي / Failed to save channels to local storage:', e);
      }
    } else {
      console.log('لم يتم العثور على قنوات جديدة غير مكررة / No new unique channels found');
    }
  } else {
    console.warn('لم يتم استلام أي قنوات من Supabase / No channels received from Supabase');
  }
  
  // تحديث البلدان مع منع التكرار
  // Update countries with duplication prevention
  if (countriesData && countriesData.length > 0) {
    console.log(`تم استلام ${countriesData.length} بلد من Supabase / Received ${countriesData.length} countries from Supabase`);
    
    // إنشاء مجموعة من معرفات البلدان الموجودة
    const existingCountryIds = new Set(countries.map(c => c.id));
    
    // إنشاء مجموعة من أسماء البلدان الموجودة
    const existingCountryNames = new Set(countries.map(c => c.name.toLowerCase()));
    
    // إضافة البلدان الجديدة فقط (غير المكررة)
    const uniqueNewCountries = (countriesData as Country[]).filter(newCountry => 
      !existingCountryIds.has(newCountry.id) && 
      !existingCountryNames.has(newCountry.name.toLowerCase())
    );
    
    if (uniqueNewCountries.length > 0) {
      console.log(`إضافة ${uniqueNewCountries.length} بلد جديد غير مكرر / Adding ${uniqueNewCountries.length} new unique countries`);
      countries.push(...uniqueNewCountries);
      
      try {
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
      } catch (e) {
        console.warn('لم يتم حفظ البلدان في التخزين المحلي / Failed to save countries to local storage:', e);
      }
    } else {
      console.log('لم يتم العثور على بلدان جديدة غير مكررة / No new unique countries found');
    }
  } else {
    console.warn('لم يتم استلام أي بلدان من Supabase / No countries received from Supabase');
  }
  
  // تحديث الفئات مع منع التكرار
  // Update categories with duplication prevention
  if (categoriesData && categoriesData.length > 0) {
    console.log(`تم استلام ${categoriesData.length} فئة من Supabase / Received ${categoriesData.length} categories from Supabase`);
    
    // إنشاء مجموعة من معرفات الفئات الموجودة
    const existingCategoryIds = new Set(categories.map(c => c.id));
    
    // إنشاء مجموعة من أسماء الفئات الموجودة
    const existingCategoryNames = new Set(categories.map(c => c.name.toLowerCase()));
    
    // إضافة الفئات الجديدة فقط (غير المكررة)
    const uniqueNewCategories = (categoriesData as Category[]).filter(newCategory => 
      !existingCategoryIds.has(newCategory.id) && 
      !existingCategoryNames.has(newCategory.name.toLowerCase())
    );
    
    if (uniqueNewCategories.length > 0) {
      console.log(`إضافة ${uniqueNewCategories.length} فئة جديدة غير مكررة / Adding ${uniqueNewCategories.length} new unique categories`);
      categories.push(...uniqueNewCategories);
      
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      } catch (e) {
        console.warn('لم يتم حفظ الفئات في التخزين المحلي / Failed to save categories to local storage:', e);
      }
    } else {
      console.log('لم يتم العثور على فئات جديدة غير مكررة / No new unique categories found');
    }
  } else {
    console.warn('لم يتم استلام أي فئات من Supabase / No categories received from Supabase');
  }
};
