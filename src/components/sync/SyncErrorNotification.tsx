
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncErrorNotificationProps {
  error: Error | null;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
  syncActive?: boolean;
  syncTimestamp?: string | null;
}

const SyncErrorNotification: React.FC<SyncErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss,
  syncActive = false,
  syncTimestamp = null
}) => {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    suggestions: string[];
  }>({
    title: 'خطأ في المزامنة',
    description: 'حدث خطأ غير معروف أثناء محاولة المزامنة.',
    severity: 'medium',
    suggestions: ['حاول مرة أخرى لاحقًا', 'تحقق من اتصالك بالإنترنت']
  });

  React.useEffect(() => {
    if (error) {
      analyzeError(error);
    }
  }, [error]);

  const analyzeError = (error: Error) => {
    let title = 'خطأ في المزامنة';
    let description = error.message || 'حدث خطأ غير معروف أثناء محاولة المزامنة.';
    let severity: 'low' | 'medium' | 'high' = 'medium';
    let suggestions: string[] = ['حاول مرة أخرى لاحقًا', 'تحقق من اتصالك بالإنترنت'];

    // تحليل نوع الخطأ بناءً على الرسالة
    if (description.includes('network') || description.includes('internet') || description.includes('connection')) {
      title = 'خطأ في الاتصال';
      description = 'يبدو أن هناك مشكلة في الاتصال بالإنترنت.';
      severity = 'high';
      suggestions = [
        'تحقق من اتصالك بالإنترنت',
        'تحقق من جدار الحماية أو إعدادات الشبكة',
        'حاول استخدام شبكة مختلفة إذا كان ذلك ممكنًا'
      ];
    } else if (description.includes('timeout') || description.includes('timed out')) {
      title = 'انتهاء مهلة الاتصال';
      description = 'استغرقت عملية المزامنة وقتًا طويلاً ولم تكتمل.';
      severity = 'medium';
      suggestions = [
        'تحقق من سرعة الإنترنت لديك',
        'حاول مرة أخرى عندما يكون الاتصال أكثر استقرارًا',
        'جرب استخدام مصدر بيانات مختلف'
      ];
    } else if (description.includes('permission') || description.includes('access') || description.includes('auth')) {
      title = 'خطأ في الصلاحيات';
      description = 'ليس لديك الصلاحيات اللازمة لإجراء هذه العملية.';
      severity = 'high';
      suggestions = [
        'تحقق من تسجيل دخولك',
        'قم بتسجيل الخروج وإعادة تسجيل الدخول',
        'تواصل مع المسؤول للحصول على المساعدة'
      ];
    } else if (description.includes('duplicate') || description.includes('already exists')) {
      title = 'خطأ بيانات مكررة';
      description = 'هناك بيانات مكررة تمنع إكمال المزامنة.';
      severity = 'low';
      suggestions = [
        'حاول إعادة تعيين البيانات المحلية',
        'جرب خيار "مزامنة كاملة" لتجاوز هذه المشكلة'
      ];
    } else if (description.includes('database') || description.includes('data') || description.includes('storage')) {
      title = 'خطأ في قاعدة البيانات';
      description = 'حدثت مشكلة أثناء التعامل مع البيانات.';
      severity = 'medium';
      suggestions = [
        'حاول مسح ذاكرة التخزين المؤقت في المتصفح',
        'جرب استخدام وضع "مزامنة كاملة"',
        'قد تحتاج إلى إعادة تعيين البيانات المحلية'
      ];
    }

    setErrorDetails({
      title,
      description,
      severity,
      suggestions
    });
  };

  const handleRetry = async () => {
    if (onRetry) {
      try {
        setIsRetrying(true);
        await onRetry();
        toast({
          title: "تمت إعادة المحاولة بنجاح",
          description: "تم تجاوز المشكلة السابقة وإكمال المزامنة",
          variant: "default",
        });
      } catch (retryError) {
        console.error('فشلت إعادة المحاولة:', retryError);
        toast({
          title: "فشلت إعادة المحاولة",
          description: "لم يتم حل المشكلة. يرجى المحاولة مرة أخرى لاحقًا.",
          variant: "destructive",
        });
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // إذا لم يكن هناك خطأ، لا تظهر شيئًا
  if (!error) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Alert 
        variant="destructive"
        className={
          errorDetails.severity === 'low' 
            ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' 
            : errorDetails.severity === 'medium'
            ? 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300'
            : undefined // استخدم الافتراضي للخطورة العالية (destructive)
        }
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{errorDetails.title}</AlertTitle>
        <AlertDescription className="mt-2">
          {errorDetails.description}
          
          <div className="mt-2 flex gap-2">
            {onRetry && (
              <Button 
                size="sm" 
                onClick={handleRetry} 
                disabled={isRetrying || syncActive}
                variant={
                  errorDetails.severity === 'low' ? "outline" :
                  errorDetails.severity === 'medium' ? "outline" :
                  "default"
                }
                className={
                  errorDetails.severity === 'low' 
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300' 
                    : errorDetails.severity === 'medium'
                    ? 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300'
                    : undefined
                }
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> جاري المحاولة...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" /> إعادة المحاولة
                  </>
                )}
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowDialog(true)}
            >
              <Info className="h-3 w-3 mr-1" /> تفاصيل أكثر
            </Button>
            
            {onDismiss && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDismiss}
                className="ml-auto"
              >
                تجاهل
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تفاصيل الخطأ</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p><span className="font-medium">الخطأ:</span> {error.message}</p>
                {syncTimestamp && (
                  <p><span className="font-medium">آخر مزامنة ناجحة:</span> {new Date(syncTimestamp).toLocaleString()}</p>
                )}
                <p><span className="font-medium">مستوى الخطورة:</span> {
                  errorDetails.severity === 'high' ? 'عالي' :
                  errorDetails.severity === 'medium' ? 'متوسط' : 'منخفض'
                }</p>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">اقتراحات لحل المشكلة:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {errorDetails.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إغلاق</AlertDialogCancel>
            {onRetry && (
              <AlertDialogAction onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? 'جاري المحاولة...' : 'إعادة المحاولة'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SyncErrorNotification;
