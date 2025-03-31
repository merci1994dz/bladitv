
/**
 * إعداد عميل Supabase
 * Supabase client setup
 */

import { createClient } from '@supabase/supabase-js';

// البيئة الافتراضية لـ Supabase للتطوير
// Default Supabase environment for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'your-anon-key';

// إنشاء وتصدير عميل Supabase
// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * التحقق مما إذا كان العميل جاهزًا
 * Check if the client is ready
 */
export const isSupabaseClientReady = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL !== 'https://example.supabase.co');
};

/**
 * التحقق من الاتصال بـ Supabase
 * Check connection to Supabase
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseClientReady()) {
    console.warn('Supabase client not ready: missing URL or Key');
    return false;
  }
  
  try {
    // محاولة إجراء استعلام بسيط
    // Try a simple query
    const { data, error } = await supabase.from('channels').select('count');
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};
