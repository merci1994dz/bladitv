
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_KEYS } from '../../config';
import { Channel } from '@/types';
import { StreamingLink } from '@/types/externalStreaming';

// محاولات إعادة التهيئة
const MAX_INIT_ATTEMPTS = 3;
const INIT_RETRY_DELAY = 2000;

/**
 * تهيئة الجداول في Supabase (للمرة الأولى) مع تحسين الأداء
 */
export const initializeSupabaseTables = async (): Promise<boolean> => {
  let attempts = 0;
  
  // تنفيذ محاولات متعددة للتهيئة
  const attemptInitialization = async (): Promise<boolean> => {
    attempts++;
    
    try {
      console.log(`محاولة تهيئة جداول Supabase (${attempts}/${MAX_INIT_ATTEMPTS})...`);
      
      // تحقق مما إذا كانت الجداول موجودة بالفعل باستخدام طلب خفيف
      const { data, error, count } = await supabase
        .from('channels')
        .select('id', { count: 'exact', head: true });
      
      if (error) {
        if (attempts < MAX_INIT_ATTEMPTS) {
          console.warn('خطأ في التحقق من وجود جداول Supabase:', error);
          console.log(`إعادة المحاولة بعد ${INIT_RETRY_DELAY}ms...`);
          
          // انتظار قبل إعادة المحاولة
          await new Promise(resolve => setTimeout(resolve, INIT_RETRY_DELAY));
          return attemptInitialization();
        }
        
        throw error;
      }
      
      // التحقق من الحاجة لتحميل البيانات المخزنة محليًا
      if (count === 0) {
        console.log('جداول Supabase فارغة، جاري تحميل البيانات المحلية...');
        await uploadLocalDataToSupabase();
        console.log('تم تحميل البيانات المحلية إلى Supabase بنجاح');
      } else {
        console.log(`جداول Supabase تحتوي على بيانات بالفعل (${count} قناة)`);
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تهيئة جداول Supabase:', error);
      
      if (attempts < MAX_INIT_ATTEMPTS) {
        console.log(`إعادة المحاولة بعد ${INIT_RETRY_DELAY * attempts}ms...`);
        
        // انتظار متزايد قبل إعادة المحاولة
        await new Promise(resolve => setTimeout(resolve, INIT_RETRY_DELAY * attempts));
        return attemptInitialization();
      }
      
      return false;
    }
  };
  
  return attemptInitialization();
};

/**
 * تحميل البيانات المخزنة محليًا إلى Supabase بطريقة محسنة
 */
const uploadLocalDataToSupabase = async (): Promise<void> => {
  // تحميل القنوات في مجموعات صغيرة لتحسين الأداء
  const BATCH_SIZE = 20;
  
  const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  
  // تحميل القنوات على دفعات
  if (storedChannels) {
    try {
      const parsedChannels = JSON.parse(storedChannels);
      
      if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
        // تحويل البيانات إلى صيغة Supabase
        const supabaseChannels = parsedChannels.map(ch => ({
          id: ch.id.includes('-') ? ch.id : crypto.randomUUID(),
          name: ch.name,
          logo: ch.logo,
          stream_url: ch.streamUrl,
          category: ch.category,
          country: ch.country,
          is_favorite: ch.isFavorite,
          last_watched: ch.lastWatched,
          external_links: ch.externalLinks || []
        }));
        
        // تقسيم القنوات إلى دفعات
        const batches = [];
        for (let i = 0; i < supabaseChannels.length; i += BATCH_SIZE) {
          batches.push(supabaseChannels.slice(i, i + BATCH_SIZE));
        }
        
        // تحميل القنوات على دفعات
        console.log(`جاري تحميل ${supabaseChannels.length} قناة على ${batches.length} دفعات...`);
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const { error } = await supabase.from('channels').insert(batch);
          
          if (error) {
            console.error(`خطأ في تحميل الدفعة ${i+1}/${batches.length}:`, error);
          } else {
            console.log(`تم تحميل الدفعة ${i+1}/${batches.length} بنجاح (${batch.length} قناة)`);
          }
        }
      }
    } catch (error) {
      console.error('خطأ في تحليل أو تحميل القنوات:', error);
    }
  }
  
  // تحميل البلدان
  if (storedCountries) {
    try {
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
          console.log(`تم تحميل ${supabaseCountries.length} دولة إلى Supabase بنجاح`);
        }
      }
    } catch (error) {
      console.error('خطأ في تحليل أو تحميل البلدان:', error);
    }
  }
  
  // تحميل الفئات
  if (storedCategories) {
    try {
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
          console.log(`تم تحميل ${supabaseCategories.length} فئة إلى Supabase بنجاح`);
        }
      }
    } catch (error) {
      console.error('خطأ في تحليل أو تحميل الفئات:', error);
    }
  }
};
