
/**
 * معالجة أخطاء الفيديو
 */
import { toast } from "@/hooks/use-toast";
import { setupVideoSource } from '../useVideoSetup';
import { setupVideoAttributes } from './videoCleanup';

/**
 * معالجة خطأ NotAllowedError - محاولة بديلة للتشغيل
 * @param videoRef مرجع عنصر الفيديو
 * @param setError دالة تعيين الخطأ
 * @param setIsLoading دالة تعيين حالة التحميل
 * @param setIsPlaying دالة تعيين حالة التشغيل
 * @returns وعد يشير إلى نجاح أو فشل المحاولة
 */
export const handleNotAllowedError = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  setError: (error: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setIsPlaying: (playing: boolean) => void
): Promise<boolean> => {
  if (!videoRef.current) return false;
  
  setError('انقر على الشاشة لبدء التشغيل');
  setIsLoading(false);
  
  try {
    console.log("محاولة التشغيل مع كتم الصوت");
    videoRef.current.muted = true;
    
    await videoRef.current.play();
    console.log("نجح التشغيل الصامت، إلغاء الكتم");
    
    // إضافة مستمع للنقر لإلغاء كتم الصوت
    const unmuteOnClick = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        setError(null);
      }
      document.removeEventListener('click', unmuteOnClick);
    };
    
    document.addEventListener('click', unmuteOnClick, { once: true });
    setIsPlaying(true);
    setIsLoading(false);
    
    return true;
  } catch (muteErr) {
    console.error('فشل التشغيل حتى مع كتم الصوت:', muteErr);
    setError('فشل في تشغيل البث. حاول النقر فوق الشاشة لبدء التشغيل');
    return false;
  }
};

/**
 * معالجة أخطاء التشغيل وترجمتها إلى رسائل مفهومة
 * @param error الخطأ الذي حدث
 * @returns رسالة الخطأ المناسبة
 */
export const translatePlaybackError = (error: any): string => {
  let errorMessage = 'فشل في تشغيل البث، حاول مرة أخرى';
  
  if (error.name === "AbortError") {
    errorMessage = 'تم إلغاء تحميل الفيديو، حاول مرة أخرى';
  } else if (error.name === "NetworkError" || error.message?.includes('network')) {
    errorMessage = 'فشل في تحميل الفيديو، تحقق من اتصالك بالإنترنت';
  } else if (error.name === "NotAllowedError") {
    errorMessage = 'انقر للتشغيل، التشغيل التلقائي ممنوع';
  } else if (error.name === "NotSupportedError") {
    errorMessage = 'تنسيق الفيديو غير مدعوم في هذا المتصفح';
  }
  
  return errorMessage;
};

/**
 * محاولة تشغيل الفيديو مع معالجة الأخطاء المحتملة
 * @param videoRef مرجع عنصر الفيديو
 * @param setIsPlaying دالة تعيين حالة التشغيل
 * @param setIsLoading دالة تعيين حالة التحميل
 * @param setError دالة تعيين الخطأ
 * @returns وعد يشير إلى نجاح أو فشل المحاولة
 */
export const attemptVideoPlay = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  setIsPlaying: (playing: boolean) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<boolean> => {
  if (!videoRef.current) return false;
  
  try {
    await videoRef.current.play();
    console.log("تم تشغيل الفيديو بنجاح");
    setIsPlaying(true);
    setIsLoading(false);
    return true;
  } catch (err: any) {
    console.error('خطأ في تشغيل الفيديو:', err);
    
    // معالجة خاصة لحالة NotAllowedError
    if (err.name === "NotAllowedError") {
      return await handleNotAllowedError(videoRef, setError, setIsLoading, setIsPlaying);
    }
    
    // معالجة أنواع الأخطاء الأخرى
    setError(translatePlaybackError(err));
    setIsLoading(false);
    return false;
  }
};

/**
 * عرض إشعار نجاح إعادة المحاولة
 */
export const showRetrySuccessToast = (): void => {
  toast({
    title: "تم استئناف التشغيل",
    description: "تم استئناف تشغيل البث بنجاح",
    duration: 3000,
  });
};

/**
 * عرض إشعار فشل إعادة المحاولة
 */
export const showRetryFailureToast = (): void => {
  toast({
    title: "تعذر تشغيل القناة",
    description: "يرجى التحقق من اتصالك بالإنترنت وانقر على إعادة المحاولة",
    variant: "destructive",
    duration: 5000,
  });
};
