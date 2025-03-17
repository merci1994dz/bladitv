
/**
 * أدوات مساعدة لتشغيل الفيديو
 */
import { VideoRef } from '../useVideoSetup';

/**
 * محاولة تشغيل الفيديو مع معالجة الأخطاء الشائعة
 * @param videoRef مرجع عنصر الفيديو
 * @param setIsPlaying دالة لتعيين حالة التشغيل
 * @param setIsLoading دالة لتعيين حالة التحميل
 * @param setError دالة لتعيين رسالة الخطأ
 * @returns وعد يشير إلى نجاح عملية التشغيل
 */
export const attemptVideoPlay = async (
  videoRef: VideoRef,
  setIsPlaying: (playing: boolean) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<boolean> => {
  if (!videoRef.current) return false;
  
  try {
    // محاولة التشغيل
    await videoRef.current.play();
    
    setIsPlaying(true);
    setIsLoading(false);
    setError(null);
    
    return true;
  } catch (error: any) {
    console.error('خطأ في تشغيل الفيديو:', error);
    
    // معالجة خطأ AutoplayNotAllowed
    if (error.name === 'NotAllowedError') {
      console.warn('التشغيل التلقائي غير مسموح، يرجى النقر للتشغيل');
      setError('انقر للتشغيل، التشغيل التلقائي ممنوع');
    } else {
      setError(`فشل في تشغيل الفيديو: ${error.message || 'خطأ غير معروف'}`);
    }
    
    setIsPlaying(false);
    setIsLoading(false);
    
    return false;
  }
};
