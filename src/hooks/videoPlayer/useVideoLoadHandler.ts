
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
      // تنظيف مشغل الفيديو بشكل كامل
      videoRef.current.pause();
      
      // إزالة معالجات الأحداث لتجنب تضاربها
      videoRef.current.oncanplay = null;
      videoRef.current.onplaying = null;
      videoRef.current.onerror = null;
      videoRef.current.onloadeddata = null;
      videoRef.current.onprogress = null;
      
      // إزالة السمات الحالية
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // تعيين بعض السمات الأساسية
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true; // تمكين التشغيل التلقائي للمحاولة
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      
      // إضافة سمات إضافية للتوافق الأفضل
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.setAttribute('webkit-playsinline', '');
      videoRef.current.setAttribute('x5-playsinline', '');
      videoRef.current.crossOrigin = 'anonymous';
      
      // إعداد المصدر وإضافة معالجات الأحداث
      if (setupVideoSource(videoRef.current, channel.streamUrl)) {
        console.log("تم إعداد مصدر الفيديو بنجاح");
        
        // معالجات الأحداث للتوافق مع مختلف المتصفحات
        videoRef.current.oncanplay = () => {
          console.log("يمكن تشغيل الفيديو الآن");
          setIsLoading(false);
        };
        
        videoRef.current.onloadeddata = () => {
          console.log("تم تحميل بيانات الفيديو");
          
          // تحديث الحالة بعد تأخير قصير للسماح بإكمال التهيئة
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        };
        
        videoRef.current.onplaying = () => {
          console.log("بدأ تشغيل الفيديو");
          setIsLoading(false);
        };
        
        videoRef.current.onerror = (e) => {
          console.error("خطأ في تحميل الفيديو", e, videoRef.current?.error);
          
          // معلومات خطأ أكثر تفصيلاً
          const errorCode = videoRef.current?.error?.code || 0;
          const errorMsg = videoRef.current?.error?.message || 'خطأ غير معروف';
          console.error(`رمز الخطأ: ${errorCode}, الرسالة: ${errorMsg}`);
          
          setError(`فشل في تحميل الفيديو: ${errorMsg}`);
          setIsLoading(false);
        };
        
        // محاولة التشغيل مع خيارات بديلة
        setTimeout(() => {
          if (!videoRef.current) return;
          
          try {
            // محاولة التشغيل المباشرة
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log("تم تشغيل الفيديو بنجاح");
                setIsLoading(false);
              }).catch(err => {
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
                  
                  // محاولة التشغيل الصامت كحل بديل
                  setTimeout(() => {
                    try {
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play().then(() => {
                          console.log("تم التشغيل الصامت، سيتم إلغاء الكتم لاحقًا");
                          
                          // إلغاء كتم الصوت بعد التفاعل
                          document.addEventListener('click', function unmute() {
                            if (videoRef.current) {
                              videoRef.current.muted = false;
                              document.removeEventListener('click', unmute);
                            }
                          }, { once: true });
                        }).catch(e => {
                          console.error("فشل حتى التشغيل الصامت:", e);
                        });
                      }
                    } catch (e) {
                      console.error("خطأ في التشغيل الصامت:", e);
                    }
                  }, 1000);
                } else {
                  // أخطاء أخرى (مثل الشبكة)
                  setError('فشل في تشغيل البث، تحقق من اتصالك بالإنترنت');
                }
              });
            }
          } catch (e) {
            console.error("خطأ عام في التشغيل:", e);
          }
        }, 800); // زيادة التأخير لإعطاء وقت أكبر لتهيئة الفيديو
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
