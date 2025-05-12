
import React, { useEffect } from 'react';
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
    const initialDelay = 2500; // تأخير أقل للتحسين
    console.log(`سيتم بدء المزامنة الأولية بعد ${initialDelay}ms`);
    
    const initialSyncTimeout = setTimeout(async () => {
      if (!isMounted.current) return;
      
      try {
        const success = await onInitialSync();
        
        if (!success) {
          console.log('فشلت المزامنة الأولية، جاري إعادة المحاولة...');
          onRetry();
        } else {
          console.log('تمت المزامنة الأولية بنجاح');
        }
      } catch (error) {
        console.error('خطأ في المزامنة الأولية:', error);
        // تعزيز آلية إعادة المحاولة
        if (syncAttempts.current < maxRetryAttempts.current) {
          console.log(`محاولة إعادة المزامنة (${syncAttempts.current + 1}/${maxRetryAttempts.current})`);
          onRetry();
        } else {
          console.warn('تم تجاوز الحد الأقصى لمحاولات المزامنة، التحول للوضع المحلي');
        }
      }
    }, initialDelay);
    
    return () => {
      clearTimeout(initialSyncTimeout);
    };
  }, [onInitialSync, onRetry, isMounted, syncAttempts, maxRetryAttempts]);
  
  // إذا فشلت جميع المحاولات
  useEffect(() => {
    const handleMaxRetryFailure = () => {
      if (syncAttempts.current >= maxRetryAttempts.current) {
        console.warn(`فشلت جميع محاولات الاتصال (${maxRetryAttempts.current})، سيتم استخدام البيانات المحلية`);
        
        toast({
          title: "تعذر الاتصال بالمصادر",
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
