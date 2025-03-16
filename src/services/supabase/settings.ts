
import { supabase } from '@/integrations/supabase/client';
import { CMSSettings } from '../cms/types';

// جلب إعدادات CMS من Supabase
export const getSettingsFromSupabase = async (): Promise<CMSSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'main-settings')
      .maybeSingle();
    
    if (error) {
      console.error('خطأ في جلب الإعدادات من Supabase:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return data as unknown as CMSSettings;
  } catch (error) {
    console.error('خطأ في جلب الإعدادات من Supabase:', error);
    throw error;
  }
};

// تحديث إعدادات CMS في Supabase
export const updateSettingsInSupabase = async (settings: CMSSettings): Promise<CMSSettings> => {
  try {
    // التحقق مما إذا كانت الإعدادات موجودة
    const { data: existingSettings } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'main-settings')
      .maybeSingle();
    
    if (existingSettings) {
      // تحديث الإعدادات الموجودة
      const { data, error } = await supabase
        .from('settings')
        .update({ ...settings })
        .eq('id', 'main-settings')
        .select()
        .single();
      
      if (error) {
        console.error('خطأ في تحديث الإعدادات في Supabase:', error);
        throw error;
      }
      
      return data as unknown as CMSSettings;
    } else {
      // إنشاء إعدادات جديدة
      const { data, error } = await supabase
        .from('settings')
        .insert([{ id: 'main-settings', ...settings }])
        .select()
        .single();
      
      if (error) {
        console.error('خطأ في إنشاء الإعدادات في Supabase:', error);
        throw error;
      }
      
      return data as unknown as CMSSettings;
    }
  } catch (error) {
    console.error('خطأ في تحديث الإعدادات في Supabase:', error);
    throw error;
  }
};
