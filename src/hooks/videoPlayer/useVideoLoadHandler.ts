
import { VideoRef } from './useVideoSetup';
import { Channel } from '@/types';
import { setupVideoSource } from './useVideoSetup';
import { toast } from "@/hooks/use-toast";

export function useVideoLoadHandler() {
  const initializeVideoPlayback = (
    videoRef: VideoRef,
    channel: Channel,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ) => {
    if (!videoRef.current) return;
    
    if (!channel.streamUrl) {
      setError('لا يوجد رابط بث متاح لهذه القناة');
      setIsLoading(false);
      return;
    }
    
    console.log('تهيئة الفيديو للقناة:', channel.name);
    
    try {
      // تنظيف مشغل الفيديو قبل تعيين المصدر الجديد
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.load();
      
      // تعيين المصدر بعد إعطاء وقت للتنظيف
      setTimeout(() => {
        if (!videoRef.current) return;
        
        // إعداد مصدر الفيديو
        if (setupVideoSource(videoRef.current, channel.streamUrl)) {
          console.log("تم إعداد مصدر الفيديو بنجاح");
          
          // محاولة التشغيل بعد تأخير قصير للتوافق مع الأجهزة المحمولة
          setTimeout(() => {
            if (!videoRef.current) return;
            
            console.log("محاولة تشغيل الفيديو");
            try {
              // تعيين خصائص إضافية للتوافق مع الأجهزة المحمولة
              videoRef.current.playsInline = true;
              videoRef.current.volume = 1.0;
              
              const playPromise = videoRef.current.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("بدأ تشغيل الفيديو بنجاح");
                    setIsLoading(false);
                  })
                  .catch(err => {
                    console.error("خطأ في التشغيل:", err);
                    
                    // التعامل مع قيود التشغيل التلقائي (شائع في الأجهزة المحمولة)
                    if (err.name === "NotAllowedError") {
                      console.log("خطأ NotAllowedError - قيود التشغيل التلقائي");
                      setIsLoading(false);
                      toast({
                        title: "التشغيل التلقائي محظور",
                        description: "انقر على الفيديو للتشغيل",
                        duration: 3000,
                      });
                    } else {
                      setError(`فشل في تشغيل الفيديو: ${err.message || 'خطأ غير معروف'}`);
                      setIsLoading(false);
                    }
                  });
              } else {
                console.log("وعد التشغيل غير معرف - جاري محاولة تشغيل تقليدية");
                videoRef.current.onplay = () => {
                  console.log("تم تشغيل الفيديو بطريقة تقليدية");
                  setIsLoading(false);
                };
                videoRef.current.onerror = (e) => {
                  console.error("خطأ في التشغيل التقليدي:", e);
                  setError("فشل في تشغيل الفيديو بشكل تقليدي");
                  setIsLoading(false);
                };
              }
            } catch (playError) {
              console.error("خطأ أثناء محاولة التشغيل:", playError);
              setError("حدث خطأ أثناء محاولة التشغيل");
              setIsLoading(false);
            }
          }, 500);
        } else {
          setError("فشل في تهيئة مصدر الفيديو");
          setIsLoading(false);
        }
      }, 300);
    } catch (err) {
      console.error("خطأ في تهيئة الفيديو:", err);
      setError("حدث خطأ أثناء تحميل الفيديو");
      setIsLoading(false);
    }
  };

  return { initializeVideoPlayback };
}
