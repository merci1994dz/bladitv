
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { useDeviceType } from '@/hooks/use-tv';

export function useVideoFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isTV } = useDeviceType();

  // معالجة تبديل ملء الشاشة
  const toggleFullscreen = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // على أجهزة التلفزيون، غالبًا لا نحتاج إلى تبديل ملء الشاشة حيث يعمل التطبيق عادة في وضع ملء الشاشة
    if (isTV) {
      // سنقوم بتحديث الحالة للحفاظ على اتساق واجهة المستخدم
      setIsFullscreen(!isFullscreen);
      
      // إذا كان هناك واجهة برمجة تطبيقات خاصة بالتلفزيون، يمكننا استخدامها هنا
      if ((window as any).tizen && (window as any).tizen.application) {
        try {
          // Tizen API (Samsung Smart TV)
          if (!isFullscreen) {
            (window as any).tizen.application.requestFullScreen();
          } else {
            (window as any).tizen.application.exitFullScreen();
          }
        } catch (err) {
          console.error('خطأ في واجهة برمجة تطبيقات Tizen:', err);
        }
      } else if ((window as any).webOS && (window as any).webOS.platformBack) {
        try {
          // WebOS API (LG Smart TV)
          if (!isFullscreen) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          // تعطيل زر الرجوع للمنصة أثناء وضع ملء الشاشة
          (window as any).webOS.platformBack.block();
        } catch (err) {
          console.error('خطأ في واجهة برمجة تطبيقات WebOS:', err);
        }
      } else {
        // استخدام طريقة ملء الشاشة القياسية كخيار أخير
        try {
          if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        } catch (err) {
          console.error('خطأ في طلب ملء الشاشة على جهاز التلفزيون:', err);
        }
      }
      return;
    }

    // معالجة ملء الشاشة القياسية للأجهزة غير التلفزيونية
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('خطأ أثناء محاولة تمكين ملء الشاشة:', err);
        toast({
          title: "تنبيه",
          description: "تعذر تفعيل وضع ملء الشاشة.",
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // معالجة حدث تغيير ملء الشاشة
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // معالجة واجهات برمجة تطبيقات التلفزيون الذكي
    const setupTVAPIs = () => {
      // إعداد مستمع لتغيير ملء الشاشة Tizen (Samsung)
      if ((window as any).tizen && (window as any).tizen.application) {
        (window as any).tizen.application.addAppStateChangeListener((prevState: string, newState: string) => {
          if (newState === 'background') {
            setIsFullscreen(false);
          }
        });
      }
      
      // إعداد مستمع لتغيير ملء الشاشة WebOS (LG)
      if ((window as any).webOS && (window as any).webOS.platformBack) {
        (window as any).webOS.platformBack.setHandler(() => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
            return true; // منع الرجوع
          }
          return false; // السماح بالرجوع
        });
      }
    };
    
    if (isTV) {
      setupTVAPIs();
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      // مسح معالجات التلفزيون
      if (isTV) {
        if ((window as any).webOS && (window as any).webOS.platformBack) {
          (window as any).webOS.platformBack.unblock();
        }
      }
      
      // الخروج من ملء الشاشة عند الإلغاء إذا لزم الأمر
      if (document.fullscreenElement && !isTV) {
        document.exitFullscreen().catch(e => console.error('خطأ في الخروج من ملء الشاشة:', e));
      }
    };
  }, [isTV]);

  return {
    isFullscreen,
    toggleFullscreen,
    isTV
  };
}
