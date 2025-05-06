
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
    // تحديد التأخير الأولي لبدء المزامنة
    const initialDelay = 3000; // استخدام تأخير ثابت بعد إزالة Vercel
    console.log(`سيتم بدء المزامنة الأولية بعد ${initialDelay}ms`);
    
    const initialSyncTimeout = setTimeout(async () => {
      if (!isMounted.current) return;
      
      const success = await onInitialSync();
      
      if (!success) {
        onRetry();
      }
    }, initialDelay);
    
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
