
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
 * تحميل البيانات المخزنة محليًا إلى Supabase مع تحسين معالجة الأخطاء
 */
const uploadLocalDataToSupabase = async (): Promise<void> => {
  const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  
  // تحميل البيانات على دفعات لتجنب مشاكل الأداء
  const batchSize = 50;
  
  // تحميل الفئات أولاً (لأن القنوات تعتمد عليها)
  if (storedCategories) {
    try {
      const parsedCategories = JSON.parse(storedCategories);
      if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
        // إنشاء مجموعة من المعرفات الموجودة بالفعل
        const { data: existingCategories } = await supabase.from('categories').select('id');
        const existingIds = new Set((existingCategories || []).map(c => c.id));
        
        // تصفية الفئات لاستبعاد تلك الموجودة بالفعل
        const newCategories = parsedCategories
          .filter(category => !existingIds.has(category.id))
          .map(category => ({
            ...category,
            // التأكد من أن المعرفات بتنسيق UUID صالح
            id: category.id.includes('-') ? category.id : crypto.randomUUID()
          }));
        
        if (newCategories.length > 0) {
          // تقسيم الفئات إلى دفعات للإدخال
          for (let i = 0; i < newCategories.length; i += batchSize) {
            const batch = newCategories.slice(i, i + batchSize);
            const { error } = await supabase.from('categories').insert(batch).select();
            
            if (error) {
              // عرض تفاصيل الخطأ للتشخيص
              if (error.code === '23505') {
                console.warn('تم تجاوز خطأ تكرار المفتاح للفئات:', error.message);
              } else {
                console.error('خطأ في تحميل الفئات إلى Supabase:', error);
              }
            }
          }
          console.log(`تم محاولة تحميل ${newCategories.length} فئة إلى Supabase`);
        }
      }
    } catch (error) {
      console.error('خطأ في معالجة بيانات الفئات:', error);
    }
  }
  
  // تحميل البلدان (بنفس نمط الفئات)
  if (storedCountries) {
    try {
      const parsedCountries = JSON.parse(storedCountries);
      if (Array.isArray(parsedCountries) && parsedCountries.length > 0) {
        // إنشاء مجموعة من المعرفات الموجودة بالفعل
        const { data: existingCountries } = await supabase.from('countries').select('id');
        const existingIds = new Set((existingCountries || []).map(c => c.id));
        
        // تصفية البلدان لاستبعاد تلك الموجودة بالفعل
        const newCountries = parsedCountries
          .filter(country => !existingIds.has(country.id))
          .map(country => ({
            ...country,
            id: country.id.includes('-') ? country.id : crypto.randomUUID()
          }));
        
        if (newCountries.length > 0) {
          // تقسيم البلدان إلى دفعات للإدخال
          for (let i = 0; i < newCountries.length; i += batchSize) {
            const batch = newCountries.slice(i, i + batchSize);
            const { error } = await supabase.from('countries').insert(batch).select();
            
            if (error) {
              if (error.code === '23505') {
                console.warn('تم تجاوز خطأ تكرار المفتاح للبلدان:', error.message);
              } else {
                console.error('خطأ في تحميل البلدان إلى Supabase:', error);
              }
            }
          }
          console.log(`تم محاولة تحميل ${newCountries.length} بلد إلى Supabase`);
        }
      }
    } catch (error) {
      console.error('خطأ في معالجة بيانات البلدان:', error);
    }
  }
  
  // تحميل القنوات (بعد التأكد من وجود الفئات والبلدان)
  if (storedChannels) {
    try {
      const parsedChannels = JSON.parse(storedChannels);
      if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
        // إنشاء مجموعة من المعرفات الموجودة بالفعل
        const { data: existingChannels } = await supabase.from('channels').select('id');
        const existingIds = new Set((existingChannels || []).map(c => c.id));
        
        // تصفية القنوات لاستبعاد تلك الموجودة بالفعل
        const newChannels = parsedChannels
          .filter(channel => !existingIds.has(channel.id))
          .map(ch => {
            // التأكد من أن المعرف بتنسيق UUID صالح
            const channelId = ch.id.includes('-') ? ch.id : crypto.randomUUID();
            
            return {
              id: channelId,
              name: ch.name,
              logo: ch.logo,
              stream_url: ch.streamUrl,
              category: ch.category,
              country: ch.country,
              is_favorite: ch.isFavorite || false,
              last_watched: ch.lastWatched || null,
              external_links: ch.externalLinks || []
            };
          });
        
        if (newChannels.length > 0) {
          // تقسيم القنوات إلى دفعات للإدخال
          for (let i = 0; i < newChannels.length; i += batchSize) {
            const batch = newChannels.slice(i, i + batchSize);
            const { error } = await supabase.from('channels').insert(batch).select();
            
            if (error) {
              if (error.code === '23505') {
                console.warn('تم تجاوز خطأ تكرار المفتاح للقنوات:', error.message);
              } else {
                console.error('خطأ في تحميل القنوات إلى Supabase:', error);
              }
            }
          }
          console.log(`تم محاولة تحميل ${newChannels.length} قناة إلى Supabase`);
        }
      }
    } catch (error) {
      console.error('خطأ في معالجة بيانات القنوات:', error);
    }
  }
  
  // التحقق من إعدادات التطبيق وإنشائها إذا لم تكن موجودة
  try {
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('count', { count: 'exact', head: true });
      
    const settingsCount = typeof settingsData === 'object' && settingsData !== null ? (settingsData as any).count : 0;
    
    if (settingsCount === 0) {
      // إنشاء إعدادات افتراضية
      const defaultSettings = {
        id: 'default',
        site_name: 'Bladi TV',
        logo: '/logo.png',
        default_layout: 'grid',
        theme: 'dark',
        language: 'ar',
        featured_channels_limit: 10,
        recently_watched_limit: 10,
        show_featured_channels_on_home: true,
        show_categories_on_home: true,
        show_countries_on_home: true,
        show_recently_watched_on_home: true,
        hide_empty_categories: true
      };
      
      const { error } = await supabase.from('settings').insert(defaultSettings);
      if (error) {
        console.error('خطأ في إنشاء الإعدادات الافتراضية:', error);
      } else {
        console.log('تم إنشاء الإعدادات الافتراضية بنجاح');
      }
    }
  } catch (error) {
    console.error('خطأ في التحقق من إعدادات التطبيق:', error);
  }
};
