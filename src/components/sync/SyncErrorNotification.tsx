
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Function to detect if running on Vercel
const isRunningOnVercel = () => {
  return typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
};

interface SyncErrorNotificationProps {
  syncError: string | null;
}

const SyncErrorNotification: React.FC<SyncErrorNotificationProps> = ({ syncError }) => {
  const { toast } = useToast();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  
  // استخدام أسلوب تأخير ذكي لعرض الأخطاء
  useEffect(() => {
    let errorTimeout: NodeJS.Timeout | null = null;
    
    if (syncError) {
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
      const delayTime = shouldShowImmediately ? 1000 : (isRunningOnVercel() ? 8000 : 5000);
      
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
        setErrorMessage(null);
        setErrorCount(0);
      }, 1000);
      
      return () => {
        if (errorTimeout) {
          clearTimeout(errorTimeout);
        }
      };
    }
  }, [syncError, toast, errorCount, errorMessage]);
  
  // لا تقديم شيء إذا لم يكن هناك خطأ أو لم يتم عرضه بعد
  if (!showError || !errorMessage) {
    return null;
  }
  
  // إنشاء رسالة خطأ أكثر تفصيلاً استنادًا إلى نوع الخطأ
  let errorDetails = "تعذر الاتصال بمصادر البيانات. سيتم إعادة المحاولة تلقائيًا.";
  
  if (errorMessage.includes('CORS') || errorMessage.includes('origin')) {
    errorDetails = "مشكلة في الوصول إلى مصادر البيانات بسبب قيود CORS. جرب مصدرًا آخرًا.";
  } else if (errorMessage.includes('timeout') || errorMessage.includes('تجاوز المهلة')) {
    errorDetails = "انتهت مهلة الاتصال بمصادر البيانات. تحقق من سرعة الاتصال.";
  } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch failed')) {
    errorDetails = "تعذر الاتصال بمصادر البيانات. تحقق من اتصالك بالإنترنت.";
  }
  
  return (
    <Alert variant="destructive" className="mb-4 animate-in fade-in-50 duration-300">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>خطأ في المزامنة</AlertTitle>
      <AlertDescription>
        {errorDetails}
        {isRunningOnVercel() && (
          <div className="mt-1 text-xs">
            قد تكون المشكلة متعلقة بتشغيل التطبيق على Vercel.
          </div>
        )}
        {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs opacity-70 truncate">
            {errorMessage}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SyncErrorNotification;
