
import { VideoRef, setupVideoSource } from './useVideoSetup';
import { Channel } from '@/types';
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
      // تنظيف مشغل الفيديو أولاً
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // تعيين بعض السمات الأساسية للأجهزة المحمولة
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = false; // دع منطق التشغيل يتعامل مع هذا
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0; // تأكد من أن الصوت عالٍ
      
      // إعداد المصدر وإضافة معالجات الأحداث
      if (setupVideoSource(videoRef.current, channel.streamUrl)) {
        console.log("تم إعداد مصدر الفيديو بنجاح");
        
        // معالجات الأحداث الأساسية للتوافق مع الأجهزة المحمولة
        videoRef.current.oncanplay = () => {
          console.log("يمكن تشغيل الفيديو الآن");
          setIsLoading(false);
        };
        
        videoRef.current.onplaying = () => {
          console.log("بدأ تشغيل الفيديو");
          setIsLoading(false);
        };
        
        videoRef.current.onerror = (e) => {
          console.error("خطأ في تحميل الفيديو", e);
          setError('فشل في تحميل الفيديو');
          setIsLoading(false);
        };
        
        // محاولة التشغيل مع تأخير للأجهزة المحمولة
        setTimeout(() => {
          if (!videoRef.current) return;
          
          try {
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                console.error("خطأ في التشغيل:", err.name);
                
                // التعامل مع قيود التشغيل التلقائي
                if (err.name === "NotAllowedError") {
                  console.log("التشغيل التلقائي مقيد - يحتاج المستخدم إلى التفاعل");
                  setIsLoading(false);
                  setError('انقر للتشغيل');
                  
                  toast({
                    title: "انقر للتشغيل",
                    description: "انقر على الشاشة لبدء البث",
                    duration: 3000,
                  });
                } else {
                  // أخطاء أخرى (مثل الشبكة)
                  setError('فشل في تشغيل البث، تحقق من اتصالك بالإنترنت');
                }
              });
            }
          } catch (e) {
            console.error("خطأ عام في التشغيل:", e);
          }
        }, 500); // زيادة التأخير قليلاً لإعطاء وقت أكبر لتهيئة الفيديو
      } else {
        setError("فشل في إعداد مصدر الفيديو");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("خطأ في تهيئة الفيديو:", err);
      setError("حدث خطأ أثناء تحميل الفيديو");
      setIsLoading(false);
    }
  };

  return { initializeVideoPlayback };
}
