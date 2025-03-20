
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { isRunningOnVercel } from '@/services/sync/remote/fetch/skewProtection';

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
    let errorTimeout: NodeJS.Timeout;
    
    if (syncError) {
      // زيادة عداد الأخطاء لتجنب العرض المتكرر
      setErrorCount(prev => prev + 1);
      
      // تأكد من عدم عرض الأخطاء للمستخدم إلا بعد حدوثها بشكل متكرر
      const shouldShowError = errorCount >= 2;
      
      // تخزين رسالة الخطأ للاستخدام لاحقًا
      setErrorMessage(syncError);
      
      // تأخير إظهار الخطأ للسماح بمحاولات إعادة الاتصال التلقائية
      const delayTime = isRunningOnVercel() ? 10000 : 7000; // تأخير أطول على Vercel
      
      errorTimeout = setTimeout(() => {
        // إظهار الخطأ للمستخدم فقط بعد فشل المحاولات المتعددة أو إذا كان خطأً حرجًا
        if (shouldShowError) {
          setShowError(true);
          
          // عرض إشعار فقط للأخطاء غير المعروضة مسبقًا
          toast({
            title: "خطأ في المزامنة",
            description: "تعذر تحديث البيانات. جاري إعادة المحاولة تلقائيًا...",
            variant: "destructive",
            duration: 7000
          });
        }
      }, delayTime);
      
      return () => {
        clearTimeout(errorTimeout);
      };
    } else {
      // إذا تم حل الخطأ، قم بإخفاء رسالة الخطأ وإعادة تعيين العداد
      setShowError(false);
      setErrorMessage(null);
      setErrorCount(0);
    }
  }, [syncError, toast, errorCount]);
  
  // تقديم واجهة المستخدم في حالة الخطأ المستمر فقط
  if (showError && errorMessage) {
    return (
      <Alert variant="destructive" className="mb-4 animate-in fade-in-50 duration-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في المزامنة</AlertTitle>
        <AlertDescription>
          تعذر الاتصال بمصادر البيانات. سيتم إعادة المحاولة تلقائيًا.
          {isRunningOnVercel() && (
            <div className="mt-1 text-xs">
              قد تكون المشكلة متعلقة بتشغيل التطبيق على Vercel.
            </div>
          )}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs opacity-70 truncate">
              {errorMessage}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // لا تقديم شيء إذا لم يكن هناك خطأ أو لم يتم عرضه بعد
  return null;
};

export default SyncErrorNotification;
