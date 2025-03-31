
import { useState, useEffect, useCallback } from 'react';
import { syncWithSupabase, initializeSupabaseTables } from '@/services/sync/supabaseSync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/sync/sourceAvailability';

// تعريف نوع لخطأ المزامنة
interface SyncError {
  message: string;
  code?: string;
  time: string;
}

/**
 * هوك مخصص للمزامنة التلقائية
 */
export const useAutoSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<SyncError | null>(null);
  
  // التحقق من توفر المصادر الخارجية
  const checkSourceAvailability = useCallback(async () => {
    try {
      const source = await checkBladiInfoAvailability();
      setAvailableSource(source);
      return source;
    } catch (error) {
      console.error('خطأ في التحقق من توفر المصادر:', error);
      setSyncError({
        message: 'فشل التحقق من توفر المصادر',
        time: new Date().toISOString()
      });
      return null;
    }
  }, []);
  
  // تهيئة Supabase
  const initializeSupabase = useCallback(async () => {
    try {
      return await initializeSupabaseTables();
    } catch (error) {
      console.error('خطأ في تهيئة Supabase:', error);
      setSyncError({
        message: 'فشل تهيئة Supabase',
        time: new Date().toISOString()
      });
      return false;
    }
  }, []);
  
  // تنفيذ المزامنة الأولية
  const performInitialSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      // استخدام forceRefresh=true للمزامنة الأولية
      const result = await syncWithSupabase(true);
      return result;
    } catch (error) {
      console.error('خطأ في المزامنة الأولية:', error);
      setSyncError({
        message: 'فشل المزامنة الأولية',
        time: new Date().toISOString()
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);
  
  // معالج عودة الاتصال بالشبكة
  const handleOnline = useCallback(() => {
    console.log('عاد الاتصال بالشبكة، جاري التحقق من المزامنة...');
    checkSourceAvailability();
  }, [checkSourceAvailability]);
  
  // معالج استعادة التركيز
  const handleFocus = useCallback(() => {
    console.log('تمت استعادة التركيز، التحقق من الحاجة للمزامنة...');
    checkSourceAvailability();
  }, [checkSourceAvailability]);
  
  // إعداد مستمعي أحداث الشبكة والتركيز
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleOnline, handleFocus]);
  
  // إضافة دالة لإعادة تعيين خطأ المزامنة
  const resetSyncError = useCallback(() => {
    setSyncError(null);
  }, []);
  
  return {
    isSyncing,
    availableSource,
    syncError,
    checkSourceAvailability,
    initializeSupabase,
    performInitialSync,
    handleOnline,
    handleFocus,
    resetSyncError
  };
};
