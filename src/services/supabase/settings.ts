
import { supabase } from '@/integrations/supabase/client';
import { CMSSettings } from '../cms/types';

// Type mapping for Supabase settings table
interface SupabaseSettings {
  default_layout: string;
  featured_channels_limit: number;
  hide_empty_categories: boolean;
  id: string;
  language: string;
  logo: string;
  recently_watched_limit: number;
  show_categories_on_home: boolean;
  show_countries_on_home: boolean;
  show_featured_channels_on_home: boolean;
  show_recently_watched_on_home: boolean;
  site_name: string;
  theme: string;
  analyticenabled?: boolean;
}

// Convert between our app model and Supabase schema
const toCMSSettings = (supabaseSettings: SupabaseSettings): CMSSettings => ({
  siteName: supabaseSettings.site_name,
  logo: supabaseSettings.logo,
  defaultLayout: supabaseSettings.default_layout,
  theme: supabaseSettings.theme as any,
  featuredChannelsLimit: supabaseSettings.featured_channels_limit,
  recentlyWatchedLimit: supabaseSettings.recently_watched_limit,
  showCategoriesOnHome: supabaseSettings.show_categories_on_home,
  showCountriesOnHome: supabaseSettings.show_countries_on_home,
  showFeaturedChannelsOnHome: supabaseSettings.show_featured_channels_on_home,
  showRecentlyWatchedOnHome: supabaseSettings.show_recently_watched_on_home,
  hideEmptyCategories: supabaseSettings.hide_empty_categories,
  customCss: undefined,
  customJs: undefined,
  analyticEnabled: supabaseSettings.analyticenabled || false,
  language: supabaseSettings.language
});

const toSupabaseSettings = (settings: CMSSettings): Omit<SupabaseSettings, 'id'> & { id: string } => ({
  site_name: settings.siteName,
  logo: settings.logo,
  default_layout: settings.defaultLayout,
  theme: settings.theme,
  featured_channels_limit: settings.featuredChannelsLimit,
  recently_watched_limit: settings.recentlyWatchedLimit,
  show_categories_on_home: settings.showCategoriesOnHome,
  show_countries_on_home: settings.showCountriesOnHome,
  show_featured_channels_on_home: true,
  show_recently_watched_on_home: true,
  hide_empty_categories: true,
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
