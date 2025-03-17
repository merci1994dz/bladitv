
import { VideoRef } from '../useVideoSetup';
import { toast } from "@/hooks/use-toast";

/**
 * محاولة تشغيل الفيديو مع معالجة الأخطاء
 */
export async function attemptVideoPlay(
  videoRef: VideoRef, 
  setIsPlaying: (playing: boolean) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<boolean> {
  if (!videoRef.current) return false;
  
  try {
    console.log("محاولة تشغيل الفيديو...");
    await videoRef.current.play();
    console.log("تم تشغيل الفيديو بنجاح");
    setIsPlaying(true);
    setIsLoading(false);
    return true;
  } catch (error) {
    console.error("حدث خطأ أثناء محاولة التشغيل:", error);
    
    if (error instanceof Error) {
      // معالجة خطأ عدم السماح بالتشغيل التلقائي
      if (error.name === "NotAllowedError") {
        console.log("خطأ NotAllowedError: يحتاج المستخدم للنقر على زر التشغيل");
        setError('انقر للتشغيل، التشغيل التلقائي ممنوع');
      } else {
        // أخطاء أخرى
        setError(`حدث خطأ أثناء التشغيل: ${error.message}`);
      }
    } else {
      // حالة الخطأ غير المعروف
      setError('حدث خطأ غير متوقع أثناء محاولة التشغيل');
    }
    
    setIsLoading(false);
    return false;
  }
}

/**
 * إظهار إشعار نجاح إعادة المحاولة
 */
export function showRetrySuccessToast() {
  toast({
    title: "تم إعادة التشغيل بنجاح",
    description: "تم استئناف البث",
    duration: 3000,
  });
}
