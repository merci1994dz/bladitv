
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SyncErrorNotificationProps {
  syncError: string | null;
}

const SyncErrorNotification: React.FC<SyncErrorNotificationProps> = ({ syncError }) => {
  const { toast } = useToast();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // تحسين معالجة الخطأ مع إضافة تأخير ذكي
  useEffect(() => {
    let errorTimeout: NodeJS.Timeout;
    
    if (syncError) {
      // تخزين رسالة الخطأ للاستخدام لاحقًا
      setErrorMessage(syncError);
      
      // تأخير إظهار الخطأ للسماح بمحاولات إعادة الاتصال التلقائية
      errorTimeout = setTimeout(() => {
        // إظهار الخطأ للمستخدم فقط بعد فشل المحاولات المتعددة
        setShowError(true);
        
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر تحديث البيانات. جاري إعادة المحاولة تلقائيًا...",
          variant: "destructive",
          duration: 7000, // إطالة مدة العرض
        });
      }, 7000); // زيادة التأخير قبل عرض الخطأ
      
      return () => {
        clearTimeout(errorTimeout);
        setShowError(false);
      };
    } else {
      // إذا تم حل الخطأ، قم بإخفاء رسالة الخطأ
      setShowError(false);
      setErrorMessage(null);
    }
  }, [syncError, toast]);
  
  // تقديم واجهة المستخدم في حالة الخطأ المستمر فقط
  if (showError && errorMessage) {
    return (
      <Alert variant="destructive" className="mb-4 animate-in fade-in-50 duration-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في المزامنة</AlertTitle>
        <AlertDescription>
          تعذر الاتصال بمصادر البيانات. سيتم إعادة المحاولة تلقائيًا.
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
