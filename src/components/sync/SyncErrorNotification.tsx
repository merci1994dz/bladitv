
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Info, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Function to detect if running on Vercel
const isRunningOnVercel = () => {
  return typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
};

interface SyncErrorNotificationProps {
  syncError: string | null;
  onRetry?: () => void;
}

const SyncErrorNotification: React.FC<SyncErrorNotificationProps> = ({ 
  syncError, 
  onRetry 
}) => {
  const { toast } = useToast();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  
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
        syncError.includes('خطأ حرج');
      
      // تأخير أقصر للأخطاء الحرجة
      const delayTime = shouldShowImmediately ? 500 : (isRunningOnVercel() ? 5000 : 3000);
      
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
  }, [syncError, toast, errorCount, errorMessage, isDismissed]);
  
  // لا تقديم شيء إذا لم يكن هناك خطأ أو تم رفضه أو لم يتم عرضه بعد
  if (!showError || !errorMessage || isDismissed) {
    return null;
  }
  
  // إنشاء رسالة خطأ أكثر تفصيلاً استنادًا إلى نوع الخطأ
  let errorDetails = "تعذر الاتصال بمصادر البيانات. سيتم إعادة المحاولة تلقائيًا.";
  let actionable = true;
  
  if (errorMessage.includes('CORS') || errorMessage.includes('origin')) {
    errorDetails = "مشكلة في الوصول إلى مصادر البيانات بسبب قيود CORS. جرب مصدرًا آخرًا.";
  } else if (errorMessage.includes('timeout') || errorMessage.includes('تجاوز المهلة')) {
    errorDetails = "انتهت مهلة الاتصال بمصادر البيانات. تحقق من سرعة الاتصال.";
  } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch failed')) {
    errorDetails = "تعذر الاتصال بمصادر البيانات. تحقق من اتصالك بالإنترنت.";
  } else if (errorMessage.includes('authentication') || errorMessage.includes('مصادقة')) {
    errorDetails = "خطأ في المصادقة. قد تحتاج إلى إعادة تسجيل الدخول.";
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
  
  // معالجة رفض الإشعار
  const handleDismiss = () => {
    setIsDismissed(true);
    setShowError(false);
  };
  
  return (
    <Alert variant="destructive" className="mb-4 animate-in fade-in-50 duration-300 relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex justify-between items-center">
        <span>خطأ في المزامنة</span>
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
        <p>{errorDetails}</p>
        
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
        
        {actionable && onRetry && (
          <div className="mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              className="bg-red-900/20 border-red-900/30 hover:bg-red-900/30 text-white"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              إعادة المحاولة
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SyncErrorNotification;
