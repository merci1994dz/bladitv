
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_KEYS } from '../../config';
import { Channel } from '@/types';
import { StreamingLink } from '@/types/externalStreaming';

/**
 * تهيئة الجداول في Supabase (للمرة الأولى)
 */
export const initializeSupabaseTables = async (): Promise<boolean> => {
  try {
    // تحقق مما إذا كانت الجداول موجودة بالفعل
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('count', { count: 'exact', head: true });
    
    if (channelsError) {
      console.error('خطأ في التحقق من وجود جداول Supabase:', channelsError);
      // ربما الجداول غير موجودة بعد
      console.log('جداول Supabase ربما غير موجودة، جاري التهيئة...');
      return false;
    }
    
    // تحميل البيانات المخزنة محليًا إلى Supabase إذا كانت الجداول فارغة
    const countValue = typeof channelsData === 'object' && channelsData !== null ? (channelsData as any).count : 0;
    if (countValue === 0) {
      console.log('جداول Supabase فارغة، جاري تحميل البيانات المحلية...');
      
      await uploadLocalDataToSupabase();
      
      console.log('تم تحميل البيانات المحلية إلى Supabase بنجاح');
    } else {
      console.log(`جداول Supabase تحتوي على بيانات بالفعل (${countValue} قناة)`);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في تهيئة جداول Supabase:', error);
    return false;
  }
};

/**
 * تحميل البيانات المخزنة محليًا إلى Supabase
 */
const uploadLocalDataToSupabase = async (): Promise<void> => {
  const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  
  // تحميل القنوات
  if (storedChannels) {
    const parsedChannels = JSON.parse(storedChannels);
    if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
      // تحويل البيانات إلى صيغة Supabase
      const supabaseChannels = parsedChannels.map(ch => {
        // التأكد من أن المعرف بتنسيق UUID صالح
        const channelId = ch.id.includes('-') ? ch.id : crypto.randomUUID();
        
        return {
          id: channelId,
          name: ch.name,
          logo: ch.logo,
          streamurl: ch.streamUrl,
          category: ch.category,
          country: ch.country,
          isfavorite: ch.isFavorite, // استخدام الاسم بالحروف الصغيرة
          lastwatched: ch.lastWatched, // استخدام الاسم بالحروف الصغيرة
          externallinks: ch.externalLinks || []
        };
      });
      
      const { error } = await supabase.from('channels').insert(supabaseChannels);
      if (error) {
        console.error('خطأ في تحميل القنوات إلى Supabase:', error);
      } else {
        console.log(`تم تحميل ${supabaseChannels.length} قناة إلى Supabase بنجاح`);
      }
    }
  }
  
  // تحميل البلدان
  if (storedCountries) {
    const parsedCountries = JSON.parse(storedCountries);
    if (Array.isArray(parsedCountries) && parsedCountries.length > 0) {
      // التأكد من أن المعرفات بتنسيق UUID صالح
      const supabaseCountries = parsedCountries.map(country => ({
        ...country,
        id: country.id.includes('-') ? country.id : crypto.randomUUID()
      }));
      
      const { error } = await supabase.from('countries').insert(supabaseCountries);
      if (error) {
        console.error('خطأ في تحميل البلدان إلى Supabase:', error);
      } else {
        console.log('تم تحميل البلدان إلى Supabase بنجاح');
      }
    }
  }
  
  // تحميل الفئات
  if (storedCategories) {
    const parsedCategories = JSON.parse(storedCategories);
    if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
      // التأكد من أن المعرفات بتنسيق UUID صالح
      const supabaseCategories = parsedCategories.map(category => ({
        ...category,
        id: category.id.includes('-') ? category.id : crypto.randomUUID()
      }));
      
      const { error } = await supabase.from('categories').insert(supabaseCategories);
      if (error) {
        console.error('خطأ في تحميل الفئات إلى Supabase:', error);
      } else {
        console.log('تم تحميل الفئات إلى Supabase بنجاح');
      }
    }
  }
};
