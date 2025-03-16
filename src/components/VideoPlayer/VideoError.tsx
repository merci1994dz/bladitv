
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoErrorProps {
  error: string;
  onRetry: (e: React.MouseEvent) => void;
  streamUrl?: string;
}

const VideoError: React.FC<VideoErrorProps> = ({ error, onRetry, streamUrl }) => {
  // إضافة وظائف متقدمة للتشخيص
  const handleTechnicalDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const errorDetails = {
      message: error,
      url: streamUrl ? `${streamUrl.substring(0, 30)}...` : 'غير متوفر',
      browser: navigator.userAgent,
      time: new Date().toLocaleTimeString()
    };
    
    toast({
      title: "معلومات تقنية",
      description: "تم نسخ معلومات الخطأ. يمكنك مشاركتها مع الدعم الفني.",
      duration: 3000,
    });
    
    try {
      navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    } catch (e) {
      console.error("فشل في نسخ المعلومات التقنية:", e);
    }
  };
  
  // تحديد نوع الخطأ وعرض رسالة مساعدة مخصصة
  const getErrorHelpText = () => {
    if (error.includes('تعذر الاتصال') || error.includes('فشل في تحميل') || error.includes('شبكة')) {
      return "تأكد من اتصالك بالإنترنت واختر 'إعادة المحاولة'";
    } else if (error.includes('انقر للتشغيل') || error.includes('التشغيل التلقائي')) {
      return "انقر على زر التشغيل للبدء";
    } else if (error.includes('تعذر تشغيل البث بعد عدة محاولات')) {
      return "جرب تغيير مصدر البث أو العودة لاحقًا";
    }
    return "حاول مرة أخرى أو اختر قناة مختلفة";
  };
  
  // تحديد أيقونة الخطأ المناسبة
  const ErrorIcon = () => {
    if (error.includes('اتصال') || error.includes('شبكة') || error.includes('تحميل')) {
      return <Wifi className="h-8 w-8 text-red-500 mb-2" />;
    }
    return <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />;
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/80">
      <div className="bg-black/90 rounded-xl p-4 flex flex-col items-center justify-center max-w-sm mx-auto border border-red-500/20">
        <ErrorIcon />
        
        <h3 className="text-white text-lg font-bold mb-1">خطأ في التشغيل</h3>
        <p className="text-white/80 text-sm text-center mb-2">{error}</p>
        <p className="text-white/60 text-xs text-center mb-3">{getErrorHelpText()}</p>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 px-4"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4" />
            <span>إعادة المحاولة</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-white/80 flex items-center gap-1.5 px-3 hover:bg-white/10 border-white/20"
            onClick={handleTechnicalDetails}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>تفاصيل</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoError;
