
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Info, XCircle, Database, Shield } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { checkAndFixConnectionIssues } from '@/services/sync/supabase/connection/errorFixer';

// Function to detect if running on Vercel
const isRunningOnVercel = () => {
  return typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
};

interface ErrorDetailsType {
  type: string;
  message: string;
  errorCode?: string;
  timestamp?: number;
}

interface SyncErrorNotificationProps {
  syncError: string | null;
  onRetry?: () => void;
  errorDetails?: ErrorDetailsType | null;
}

const SyncErrorNotification: React.FC<SyncErrorNotificationProps> = ({ 
  syncError, 
  onRetry,
  errorDetails
}) => {
  const { toast } = useToast();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  
  // إعادة تعيين الرفض عند تغيير الخطأ
  useEffect(() => {
    if (syncError !== errorMessage) {
      setIsDismissed(false);
    }
  }, [syncError, errorMessage]);
  
  // استخدام أسلوب تأخير ذكي لعرض الأخطاء
  useEffect(() => {
    let errorTimeout: NodeJS.Timeout | null = null;
    
    if (syncError && !isDismissed) {
      // تخزين رسالة الخطأ للاستخدام لاحقًا
      setErrorMessage(syncError);
      
      // زيادة عداد الأخطاء لتتبع تكرار الأخطاء
      setErrorCount(prev => {
        // إعادة تعيين العداد إذا كان هذا خطأ جديد مختلف عن السابق
        if (errorMessage && !syncError.includes(errorMessage)) {
          return 1;
        }
        return prev + 1;
      });
      
      // تحديد ما إذا كان ينبغي عرض الخطأ استنادًا إلى عدد المرات التي حدث فيها
      const shouldShowImmediately = 
        syncError.includes('تعذر الاتصال') || 
        syncError.includes('فشل في المزامنة') ||
        syncError.includes('خطأ حرج') ||
        syncError.includes('duplicate key') ||
        (errorDetails?.type === 'duplicate_key');
      
      // تأخير أقصر للأخطاء الحرجة
      const delayTime = shouldShowImmediately ? 300 : (isRunningOnVercel() ? 2000 : 1000);
      
      errorTimeout = setTimeout(() => {
        setShowError(true);
        
        // عرض إشعار فقط للأخطاء الهامة أو المتكررة
        if (shouldShowImmediately || errorCount > 1) {
          const isRecurring = errorCount > 1;
          
          toast({
            title: isRecurring ? "استمرار مشكلة المزامنة" : "خطأ في المزامنة",
            description: isRecurring
              ? "تعذر تحديث البيانات بعد عدة محاولات. يرجى التحقق من اتصالك بالإنترنت"
              : "تعذر تحديث البيانات. جاري إعادة المحاولة تلقائيًا...",
            variant: isRecurring ? "destructive" : "default",
            duration: isRecurring ? 8000 : 5000
          });
        }
      }, delayTime);
      
      return () => {
        if (errorTimeout) {
          clearTimeout(errorTimeout);
        }
      };
    } else {
      // إذا تم حل الخطأ، قم بإخفاء رسالة الخطأ بعد تأخير قصير
      errorTimeout = setTimeout(() => {
        setShowError(false);
        if (!syncError) {
          setErrorMessage(null);
          setErrorCount(0);
        }
      }, 1000);
      
      return () => {
        if (errorTimeout) {
          clearTimeout(errorTimeout);
        }
      };
    }
  }, [syncError, toast, errorCount, errorMessage, isDismissed, errorDetails]);
  
  // لا تقديم شيء إذا لم يكن هناك خطأ أو تم رفضه أو لم يتم عرضه بعد
  if (!showError || !errorMessage || isDismissed) {
    return null;
  }
  
  // تحديد نوع الخطأ استنادًا إلى المعلومات المتوفرة
  const errorType = errorDetails?.type || 
    (errorMessage.includes('duplicate key') || errorMessage.includes('23505') 
      ? 'duplicate_key' 
      : (errorMessage.includes('connection') || errorMessage.includes('اتصال') 
        ? 'connection' 
        : 'unknown'));
  
  // إنشاء رسالة خطأ أكثر تفصيلاً استنادًا إلى نوع الخطأ
  let errorDetails2 = "تعذر الاتصال بمصادر البيانات. سيتم إعادة المحاولة تلقائيًا.";
  let actionable = true;
  
  if (errorType === 'duplicate_key') {
    errorDetails2 = "يوجد تعارض في قيود قاعدة البيانات. جاري محاولة الإصلاح تلقائياً.";
  } else if (errorMessage.includes('CORS') || errorMessage.includes('origin')) {
    errorDetails2 = "مشكلة في الوصول إلى مصادر البيانات بسبب قيود CORS. جرب مصدرًا آخرًا.";
  } else if (errorMessage.includes('timeout') || errorMessage.includes('تجاوز المهلة')) {
    errorDetails2 = "انتهت مهلة الاتصال بمصادر البيانات. تحقق من سرعة الاتصال.";
  } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch failed')) {
    errorDetails2 = "تعذر الاتصال بمصادر البيانات. تحقق من اتصالك بالإنترنت.";
  } else if (errorMessage.includes('authentication') || errorMessage.includes('مصادقة')) {
    errorDetails2 = "خطأ في المصادقة. قد تحتاج إلى إعادة تسجيل الدخول.";
    actionable = false;
  }

  // معالجة الضغط على زر إعادة المحاولة
  const handleRetry = () => {
    if (onRetry) {
      toast({
        title: "إعادة المحاولة",
        description: "جارٍ إعادة محاولة المزامنة...",
        duration: 3000,
      });
      onRetry();
    } else {
      toast({
        title: "تعذرت إعادة المحاولة",
        description: "لا توجد وظيفة إعادة محاولة متاحة",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // معالجة محاولة الإصلاح التلقائي
  const handleAutoFix = async () => {
    setIsFixing(true);
    
    toast({
      title: "جاري محاولة الإصلاح التلقائي",
      description: "محاولة إصلاح مشاكل الاتصال بقاعدة البيانات...",
      duration: 5000,
    });
    
    try {
      const isFixed = await checkAndFixConnectionIssues();
      
      if (isFixed) {
        toast({
          title: "تم الإصلاح بنجاح",
          description: "تم إصلاح مشاكل الاتصال بقاعدة البيانات. يمكنك الآن إعادة المحاولة.",
          duration: 4000,
        });
        
        // إعادة المحاولة تلقائياً بعد الإصلاح
        if (onRetry) {
          setTimeout(() => {
            onRetry();
          }, 1000);
        }
      } else {
        toast({
          title: "تعذر الإصلاح التلقائي",
          description: "لم يتم التمكن من إصلاح المشكلة تلقائياً. حاول إعادة تحميل الصفحة.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("خطأ أثناء محاولة الإصلاح التلقائي:", error);
      
      toast({
        title: "خطأ في عملية الإصلاح",
        description: "حدث خطأ أثناء محاولة إصلاح المشكلة. يرجى إعادة تحميل الصفحة.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  // معالجة رفض الإشعار
  const handleDismiss = () => {
    setIsDismissed(true);
    setShowError(false);
  };
  
  // تحديد لون التنبيه بناءً على نوع الخطأ
  const alertVariant = errorType === 'duplicate_key' ? "warning" : "destructive";
  
  return (
    <Alert variant={alertVariant} className="mb-4 animate-in fade-in-50 duration-300 relative">
      {errorType === 'duplicate_key' ? (
        <Database className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      
      <AlertTitle className="flex justify-between items-center">
        <span>
          {errorType === 'duplicate_key' 
            ? "مشكلة في قاعدة البيانات" 
            : "خطأ في المزامنة"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full"
          onClick={handleDismiss}
        >
          <XCircle className="h-4 w-4" />
          <span className="sr-only">رفض</span>
        </Button>
      </AlertTitle>
      
      <AlertDescription className="space-y-2">
        <p>{errorDetails2}</p>
        
        {errorCount > 1 && (
          <div className="text-xs opacity-80 mt-1">
            حدث هذا الخطأ {errorCount} مرات
          </div>
        )}
        
        {isRunningOnVercel() && (
          <div className="text-xs opacity-80 mt-1">
            قد تكون المشكلة متعلقة بتشغيل التطبيق على Vercel.
          </div>
        )}
        
        {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
          <div className="text-xs opacity-70 truncate mt-1 bg-red-900/20 p-1 rounded">
            {errorMessage}
          </div>
        )}
        
        <div className="mt-2 flex gap-2">
          {actionable && onRetry && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              disabled={isFixing}
              className="bg-red-900/20 border-red-900/30 hover:bg-red-900/30 text-white"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              إعادة المحاولة
            </Button>
          )}
          
          {(errorType === 'duplicate_key' || errorType === 'connection') && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAutoFix}
              disabled={isFixing}
              className="bg-amber-900/20 border-amber-900/30 hover:bg-amber-900/30 text-white"
            >
              <Shield className="h-3 w-3 mr-2" />
              {isFixing ? "جاري الإصلاح..." : "إصلاح تلقائي"}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SyncErrorNotification;
