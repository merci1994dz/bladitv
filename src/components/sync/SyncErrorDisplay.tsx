
import React, { useEffect, useState, useCallback } from 'react';
import SyncErrorNotification from './SyncErrorNotification';
import { getSyncError, clearSyncError } from '@/services/sync/status/errorHandling';
import { toast } from '@/hooks/use-toast';
import { retry, createProgressiveRetryStrategy } from '@/utils/retryStrategy';
import { isSyncInProgress } from '@/services/sync/status/syncState';
import { checkSupabaseConnection } from '@/services/sync/supabase/connection/connectionCheck';
import { handleDuplicateKeyError } from '@/services/sync/supabase/syncErrorHandler';

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
  const [errorDetails, setErrorDetails] = useState<{ 
    type: string; 
    message: string;
    errorCode?: string;
    timestamp?: number;
  } | null>(null);
  
  // إذا لم يتم توفير خطأ مباشر، قم بالتحقق من التخزين المحلي
  useEffect(() => {
    if (propsSyncError === null) {
      try {
        const storedError = getSyncError();
        if (storedError) {
          setLocalSyncError(storedError.message);
          
          // تعيين تفاصيل الخطأ إذا كانت متوفرة
          if (storedError.details) {
            setErrorDetails({
              type: storedError.details.code || 'unknown',
              message: storedError.message,
              errorCode: storedError.details.code,
              timestamp: storedError.timestamp
            });
          }
        } else {
          setLocalSyncError(null);
          setErrorDetails(null);
        }
      } catch (error) {
        console.error('فشل في استرداد خطأ المزامنة من التخزين المحلي:', error);
        setLocalSyncError(null);
        setErrorDetails(null);
      }
    } else if (propsSyncError) {
      // تحليل الخطأ المقدم مباشرة
      const isDuplicateKey = propsSyncError.includes('duplicate key') || 
                             propsSyncError.includes('23505');
      
      const isConnectionError = propsSyncError.includes('connection') || 
                                propsSyncError.includes('اتصال') ||
                                propsSyncError.includes('network');
      
      setErrorDetails({
        type: isDuplicateKey ? 'duplicate_key' : 
              isConnectionError ? 'connection' : 'unknown',
        message: propsSyncError,
        timestamp: Date.now()
      });
    }
  }, [propsSyncError]);
  
  // التعامل مع أخطاء المفاتيح المكررة تلقائياً
  useEffect(() => {
    if (errorDetails?.type === 'duplicate_key' && !isRetrying) {
      console.log('محاولة إصلاح خطأ المفتاح المكرر تلقائياً...');
      
      const fixDuplicateKeyError = async () => {
        try {
          setIsRetrying(true);
          const isFixed = await handleDuplicateKeyError(errorDetails.message);
          
          if (isFixed) {
            // في حالة النجاح، قم بمسح الخطأ
            clearSyncError();
            setLocalSyncError(null);
            setErrorDetails(null);
            
            toast({
              title: "تم إصلاح المشكلة",
              description: "تم إصلاح مشكلة المفتاح المكرر",
              duration: 3000,
            });
            
            // إعادة المحاولة إذا كان متاحاً
            if (onRetry) {
              await onRetry();
            }
          }
        } catch (error) {
          console.error('فشل في إصلاح خطأ المفتاح المكرر:', error);
        } finally {
          setIsRetrying(false);
        }
      };
      
      fixDuplicateKeyError();
    }
  }, [errorDetails, isRetrying, onRetry]);
  
  // وظيفة إعادة المحاولة المحسنة مع آلية التأخير التقدمي
  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying || isSyncInProgress()) {
      return;
    }
    
    setIsRetrying(true);
    
    try {
      // التحقق من اتصال Supabase أولاً
      const isConnected = await checkSupabaseConnection();
      
      if (!isConnected) {
        toast({
          title: "تعذر الاتصال",
          description: "لا يمكن الاتصال بـ Supabase. تحقق من اتصالك بالإنترنت.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      await retry(
        async () => {
          await onRetry();
          // في حالة النجاح، قم بمسح الخطأ
          clearSyncError();
          setLocalSyncError(null);
          setErrorDetails(null);
          
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
  }, [onRetry, isRetrying]);
  
  // استخدم الخطأ من الخارج إذا كان موجودًا، وإلا استخدم الخطأ المحلي
  const finalError = propsSyncError || localSyncError;
  
  return (
    <SyncErrorNotification 
      syncError={finalError} 
      onRetry={handleRetry} 
      errorDetails={errorDetails} 
    />
  );
};

export default SyncErrorDisplay;
