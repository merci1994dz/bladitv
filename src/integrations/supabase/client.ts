
import { createClient } from '@supabase/supabase-js';
import { handleError } from '@/utils/errorHandling';

// استخدام السلاسل المباشرة بدلاً من متغيرات البيئة للمتغيرات على جانب العميل
const supabaseUrl = 'https://ucmvhjawucyznchetekh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbXZoamF3dWN5em5jaGV0ZWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzkxNjAsImV4cCI6MjA1NzcxNTE2MH0.X5MgR734lS9Luu8fNMHvNfjYNqU9KBTDtta7QlW4cYI';

// إنشاء عميل Supabase مع معالجة الأخطاء المتقدمة
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'BladiTV',
      'x-application-version': '1.0.0'
    },
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        cache: 'no-cache',
        credentials: 'same-origin'
      }).catch(error => {
        handleError(error, 'Supabase API Request', false);
        throw error;
      });
    }
  }
});

// إضافة معالج أحداث للاتصال
const handleSupabaseConnectionStatus = () => {
  try {
    // التحقق من حالة الاتصال عند بدء التشغيل
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', event);
    });
    
    // معالج دورة حياة الاتصال للتطبيق
    window.addEventListener('online', () => {
      console.log('Application is back online, reconnecting Supabase...');
    });
    
    window.addEventListener('offline', () => {
      console.log('Application is offline, Supabase operations will be queued...');
    });
  } catch (error) {
    console.error('Error setting up Supabase connection handlers:', error);
  }
};

// تهيئة معالجات الاتصال
if (typeof window !== 'undefined') {
  handleSupabaseConnectionStatus();
}

export default supabase;
