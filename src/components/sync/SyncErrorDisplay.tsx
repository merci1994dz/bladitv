
import React, { useEffect, useState, useCallback } from 'react';
import SyncErrorNotification from './SyncErrorNotification';
import { getSyncError, clearSyncError } from '@/services/sync/status/errorHandling';
import { toast } from '@/hooks/use-toast';
import { retry, createProgressiveRetryStrategy } from '@/utils/retryStrategy';
import { isSyncInProgress } from '@/services/sync/status/syncState';

interface SyncErrorDisplayProps {
  syncError: string | null;
  onRetry?: () => Promise<void>;
}

/**
 * SyncErrorDisplay component to display sync errors
 * This component gets the error from localStorage if not provided directly
 */
const SyncErrorDisplay: React.FC<SyncErrorDisplayProps> = ({ 
  syncError: propsSyncError,
  onRetry 
}) => {
  const [localSyncError, setLocalSyncError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // إذا لم يتم توفير خطأ مباشر، قم بالتحقق من التخزين المحلي
  useEffect(() => {
    if (propsSyncError === null) {
      try {
        const storedError = getSyncError();
        if (storedError) {
          setLocalSyncError(storedError.message);
        } else {
          setLocalSyncError(null);
        }
      } catch (error) {
        console.error('فشل في استرداد خطأ المزامنة من التخزين المحلي:', error);
        setLocalSyncError(null);
      }
    }
  }, [propsSyncError]);
  
  // وظيفة إعادة المحاولة المحسنة مع آلية التأخير التقدمي
  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying || isSyncInProgress()) {
      return;
    }
    
    setIsRetrying(true);
    
    try {
      await retry(
        async () => {
          await onRetry();
          // في حالة النجاح، قم بمسح الخطأ
          clearSyncError();
          setLocalSyncError(null);
          
          toast({
            title: "نجحت إعادة المحاولة",
            description: "تم تحديث البيانات بنجاح",
            duration: 3000,
          });
        },
        createProgressiveRetryStrategy(2, true)
      );
    } catch (error) {
      console.error('فشلت إعادة المحاولة:', error);
      toast({
        title: "فشلت إعادة المحاولة",
        description: "تعذر تحديث البيانات. يرجى المحاولة مرة أخرى لاحقًا.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying, toast]);
  
  // استخدم الخطأ من الخارج إذا كان موجودًا، وإلا استخدم الخطأ المحلي
  const finalError = propsSyncError || localSyncError;
  
  return <SyncErrorNotification syncError={finalError} onRetry={handleRetry} />;
};

export default SyncErrorDisplay;
