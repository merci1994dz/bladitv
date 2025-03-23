
import React, { useEffect } from 'react';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';
import { useToast } from '@/hooks/use-toast';

interface SyncRetryHandlerProps {
  onInitialSync: () => Promise<boolean>;
  onRetry: () => void;
  syncAttempts: React.MutableRefObject<number>;
  maxRetryAttempts: React.MutableRefObject<number>;
  isMounted: React.MutableRefObject<boolean>;
}

/**
 * مكون يدير محاولات المزامنة مع آلية إعادة المحاولة
 */
const SyncRetryHandler: React.FC<SyncRetryHandlerProps> = ({
  onInitialSync,
  onRetry,
  syncAttempts,
  maxRetryAttempts,
  isMounted
}) => {
  const { toast } = useToast();
  
  useEffect(() => {
    const initialDelay = isRunningOnVercel() ? 5000 : 3000;
    console.log(`سيتم بدء المزامنة الأولية بعد ${initialDelay}ms`);
    
    const initialSyncTimeout = setTimeout(async () => {
      if (!isMounted.current) return;
      
      const success = await onInitialSync();
      
      if (!success) {
        onRetry();
      }
    }, initialDelay);
    
    // تخزين معلومات عن Vercel إذا كان التطبيق يعمل عليه
    if (isRunningOnVercel()) {
      try {
        localStorage.setItem('vercel_deployment', 'true');
        localStorage.setItem('vercel_sync_enabled', 'true');
        localStorage.setItem('vercel_app_started', new Date().toISOString());
        
        // محاولة الحصول على معرف البناء من URL إذا كان متاحًا
        const urlParams = new URLSearchParams(window.location.search);
        const buildId = urlParams.get('buildId') || urlParams.get('__vercel_deployment_id');
        if (buildId) {
          localStorage.setItem('vercel_build_id', buildId);
        }
      } catch (e) {
        console.warn('تعذر تخزين معلومات Vercel:', e);
      }
    }
    
    return () => {
      clearTimeout(initialSyncTimeout);
    };
  }, [onInitialSync, onRetry, isMounted, toast]);
  
  // إذا فشلت جميع المحاولات
  useEffect(() => {
    const handleMaxRetryFailure = () => {
      if (syncAttempts.current >= maxRetryAttempts.current) {
        console.warn(`فشلت جميع محاولات الاتصال (${maxRetryAttempts.current})، سيتم استخدام البيانات المحلية`);
        
        toast({
          title: "تعذر الاتصال بـ Supabase",
          description: "سيتم استخدام البيانات المخزنة محليًا. الرجاء التحقق من اتصالك بالإنترنت.",
          variant: "destructive",
          duration: 7000,
        });
      }
    };
    
    handleMaxRetryFailure();
  }, [syncAttempts, maxRetryAttempts, toast]);
  
  return null;
};

export default SyncRetryHandler;
