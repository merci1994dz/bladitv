import { supabase } from '@/integrations/supabase/client';
import { CMSSettings } from '../cms/types';

// Type mapping for Supabase settings table
interface SupabaseSettings {
  defaultlayout: string;
  featuredchannelslimit: number;
  hideemptycategories: boolean;
  id: string;
  language: string;
  logo: string;
  recentlywatchedlimit: number;
  showcategoriesonhome: boolean;
  showcountriesonhome: boolean;
  showfeaturedchannelsonhome: boolean;
  showrecentlywatchedonhome: boolean;
  sitename: string;
  theme: string;
  analyticenabled?: boolean;
}

// Convert between our app model and Supabase schema
const toCMSSettings = (supabaseSettings: SupabaseSettings): CMSSettings => ({
  siteName: supabaseSettings.sitename,
  logo: supabaseSettings.logo,
  defaultLayout: supabaseSettings.defaultlayout,
  theme: supabaseSettings.theme as any,
  featuredChannelsLimit: supabaseSettings.featuredchannelslimit,
  recentlyWatchedLimit: supabaseSettings.recentlywatchedlimit,
  showCategoriesOnHome: supabaseSettings.showcategoriesonhome,
  showCountriesOnHome: supabaseSettings.showcountriesonhome,
  customCss: undefined,
  customJs: undefined,
  analyticEnabled: supabaseSettings.analyticenabled || false,
  language: supabaseSettings.language
});

const toSupabaseSettings = (settings: CMSSettings): Omit<SupabaseSettings, 'id'> & { id: string } => ({
  sitename: settings.siteName,
  logo: settings.logo,
  defaultlayout: settings.defaultLayout,
  theme: settings.theme,
  featuredchannelslimit: settings.featuredChannelsLimit,
  recentlywatchedlimit: settings.recentlyWatchedLimit,
  showcategoriesonhome: settings.showCategoriesOnHome,
  showcountriesonhome: settings.showCountriesOnHome,
  showfeaturedchannelsonhome: true,
  showrecentlywatchedonhome: true,
  hideemptycategories: true,
  language: settings.language,
  analyticenabled: settings.analyticEnabled,
  id: 'main-settings'
});

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
    
    return toCMSSettings(data as SupabaseSettings);
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
    
    const supabaseSettings = toSupabaseSettings(settings);
    
    if (existingSettings) {
      // تحديث الإعدادات الموجودة
      const { data, error } = await supabase
        .from('settings')
        .update(supabaseSettings)
        .eq('id', 'main-settings')
        .select()
        .single();
      
      if (error) {
        console.error('خطأ في تحديث الإعدادات في Supabase:', error);
        throw error;
      }
      
      return toCMSSettings(data as SupabaseSettings);
    } else {
      // إنشاء إعدادات جديدة
      const { data, error } = await supabase
        .from('settings')
        .insert(supabaseSettings)
        .select()
        .single();
      
      if (error) {
        console.error('خطأ في إنشاء الإعدادات في Supabase:', error);
        throw error;
      }
      
      return toCMSSettings(data as SupabaseSettings);
    }
  } catch (error) {
    console.error('خطأ في تحديث الإعدادات في Supabase:', error);
    throw error;
  }
};
