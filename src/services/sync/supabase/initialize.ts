
import { supabase } from '@/integrations/supabase/client';
import { channels, countries, categories } from '../../dataStore';
import { Channel, Country, Category } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { StreamingLink } from '@/types/externalStreaming';

/**
 * تهيئة جداول Supabase واستيراد البيانات إذا كانت فارغة
 * Initialize Supabase tables and import data if empty
 */
export const initializeSupabaseTables = async (): Promise<boolean> => {
  try {
    console.log('التحقق من حالة جداول Supabase وتهيئتها إذا لزم الأمر...');
    
    // التحقق من وجود جدول القنوات وتهيئته إذا كان فارغًا
    const { count: channelsCount, error: channelsError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true });
    
    if (channelsError) {
      console.error('خطأ في التحقق من جدول القنوات:', channelsError);
      throw channelsError;
    }
    
    // التحقق من وجود جدول البلدان وتهيئته إذا كان فارغًا
    const { count: countriesCount, error: countriesError } = await supabase
      .from('countries')
      .select('*', { count: 'exact', head: true });
    
    if (countriesError) {
      console.error('خطأ في التحقق من جدول البلدان:', countriesError);
      throw countriesError;
    }
    
    // التحقق من وجود جدول الفئات وتهيئته إذا كان فارغًا
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (categoriesError) {
      console.error('خطأ في التحقق من جدول الفئات:', categoriesError);
      throw categoriesError;
    }
    
    // إذا كانت الجداول فارغة، قم باستيراد البيانات من الذاكرة المحلية
    if (channelsCount === 0 || countriesCount === 0 || categoriesCount === 0) {
      console.log('تم اكتشاف جداول فارغة في Supabase. بدء استيراد البيانات...');
      
      // استيراد الفئات إذا كان الجدول فارغًا
      if (categoriesCount === 0 && categories.length > 0) {
        console.log(`استيراد ${categories.length} فئة إلى Supabase...`);
        
        // تحويل الفئات إلى التنسيق المتوافق مع Supabase
        const categoriesToUpload = categories.map(category => ({
          id: category.id,
          name: category.name,
          icon: category.icon
        }));
        
        const { error: importCategoriesError } = await supabase
          .from('categories')
          .insert(categoriesToUpload);
        
        if (importCategoriesError) {
          console.error('خطأ في استيراد الفئات:', importCategoriesError);
        } else {
          console.log('تم استيراد الفئات بنجاح');
        }
      }
      
      // استيراد البلدان إذا كان الجدول فارغًا
      if (countriesCount === 0 && countries.length > 0) {
        console.log(`استيراد ${countries.length} بلد إلى Supabase...`);
        
        // تحويل البلدان إلى التنسيق المتوافق مع Supabase
        const countriesToUpload = countries.map(country => ({
          id: country.id,
          name: country.name,
          flag: country.flag,
          image: country.image
        }));
        
        const { error: importCountriesError } = await supabase
          .from('countries')
          .insert(countriesToUpload);
        
        if (importCountriesError) {
          console.error('خطأ في استيراد البلدان:', importCountriesError);
        } else {
          console.log('تم استيراد البلدان بنجاح');
        }
      }
      
      // استيراد القنوات إذا كان الجدول فارغًا
      if (channelsCount === 0 && channels.length > 0) {
        console.log(`استيراد ${channels.length} قناة إلى Supabase...`);
        
        // تحويل القنوات إلى التنسيق المتوافق مع Supabase - مع معالجة external_links لتحويله إلى Json
        const channelsToUpload = channels.map(channel => ({
          id: channel.id,
          name: channel.name,
          logo: channel.logo,
          stream_url: channel.streamUrl,
          country: channel.country,
          category: channel.category,
          is_favorite: channel.isFavorite,
          last_watched: channel.lastWatched || null,
          external_links: channel.externalLinks ? JSON.parse(JSON.stringify(channel.externalLinks)) as Json : null
        }));
        
        // نظرًا لأن عدد القنوات قد يكون كبيرًا، نقوم بإرسالها على دفعات
        const batchSize = 50;
        
        for (let i = 0; i < channelsToUpload.length; i += batchSize) {
          const batch = channelsToUpload.slice(i, i + batchSize);
          console.log(`إرسال مجموعة القنوات ${i / batchSize + 1}/${Math.ceil(channelsToUpload.length / batchSize)}`);
          
          const { error: importChannelsError } = await supabase
            .from('channels')
            .insert(batch);
          
          if (importChannelsError) {
            console.error(`خطأ في استيراد مجموعة القنوات ${i / batchSize + 1}:`, importChannelsError);
          } else {
            console.log(`تم استيراد مجموعة القنوات ${i / batchSize + 1} بنجاح`);
          }
        }
      }
      
      console.log('تم الانتهاء من استيراد البيانات إلى Supabase');
    } else {
      console.log('جميع جداول Supabase تحتوي على بيانات. لا حاجة للاستيراد.');
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في تهيئة جداول Supabase:', error);
    return false;
  }
};
