
import { useEffect, useState } from 'react';
import { syncWithSupabase, setupRealtimeSync, initializeSupabaseTables } from '@/services/sync/supabaseSync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import { useToast } from '@/hooks/use-toast';

export const useAutoSync = () => {
  const { toast } = useToast();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [availableSource, setAvailableSource] = useState<string | null>(null);
  
  // Check for available Bladi Info sources
  const checkSourceAvailability = async () => {
    try {
      const availableUrl = await checkBladiInfoAvailability();
      setAvailableSource(availableUrl);
      if (availableUrl) {
        console.log(`وجدنا مصدر بيانات متاح: ${availableUrl}`);
      } else {
        console.warn('لم نتمكن من العثور على أي مصدر بيانات متاح');
      }
    } catch (error) {
      console.error('خطأ في التحقق من توفر المصادر:', error);
    }
  };
  
  // Initialize Supabase tables
  const initializeSupabase = async () => {
    try {
      await initializeSupabaseTables();
    } catch (error) {
      console.error('خطأ في تهيئة Supabase:', error);
    }
  };
  
  // Perform initial sync with Supabase
  const performInitialSync = async () => {
    console.log('بدء المزامنة الأولية مع Supabase...');
    try {
      const success = await syncWithSupabase(false);
      if (success) {
        console.log('تمت المزامنة الأولية بنجاح مع Supabase');
        setSyncError(null);
      } else {
        console.warn('فشلت المزامنة مع Supabase، جاري المحاولة مرة أخرى...');
        setSyncError('لم يمكن الاتصال بـ Supabase');
      }
    } catch (error) {
      console.error('خطأ في المزامنة الأولية مع Supabase:', error);
      setSyncError(String(error));
    }
  };
  
  // Handle network reconnection
  const handleOnline = () => {
    toast({
      title: "تم استعادة الاتصال",
      description: "جاري تحديث البيانات من Supabase...",
      duration: 3000,
    });
    syncWithSupabase(false);
    
    // Re-check available sources when connection is restored
    checkSourceAvailability();
  };
  
  // Handle tab focus (with delay to prevent multiple syncs)
  const handleFocus = () => {
    setTimeout(() => {
      console.log('تم اكتشاف العودة إلى التبويب، جاري التحقق من التحديثات...');
      syncWithSupabase(false);
    }, 1000);
  };
  
  return {
    syncError,
    availableSource,
    checkSourceAvailability,
    initializeSupabase,
    performInitialSync,
    handleOnline,
    handleFocus
  };
};
