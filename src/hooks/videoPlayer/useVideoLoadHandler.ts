
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
    
    // إضافة مؤقت للتحكم في مهلة التحميل
    const loadTimeout = setTimeout(() => {
      if (videoRef.current && videoRef.current.readyState < 3) {
        console.warn('تجاوز مهلة تحميل الفيديو');
        setError('استغرق تحميل الفيديو وقتًا طويلاً، حاول مرة أخرى');
        setIsLoading(false);
      }
    }, 20000); // 20 ثانية كحد أقصى للتحميل
    
    try {
      // تنظيف مشغل الفيديو بشكل كامل
      videoRef.current.pause();
      
      // إزالة معالجات الأحداث لتجنب تضاربها
      videoRef.current.oncanplay = null;
      videoRef.current.onplaying = null;
      videoRef.current.onerror = null;
      videoRef.current.onloadeddata = null;
      videoRef.current.onprogress = null;
      
      // تعيين معالج للأخطاء مباشرة قبل البدء
      videoRef.current.onerror = (e) => {
        clearTimeout(loadTimeout);
        console.error("خطأ مبكر في تحميل الفيديو", e, videoRef.current?.error);
        const errorMsg = videoRef.current?.error?.message || 'خطأ غير معروف في التحميل';
        setError(`فشل في تحميل الفيديو: ${errorMsg}`);
        setIsLoading(false);
      };
      
      // إزالة السمات الحالية
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // تعيين بعض السمات الأساسية
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true;
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      videoRef.current.preload = "auto"; // تحميل البيانات بشكل مسبق
      
      // إضافة سمات إضافية للتوافق الأفضل
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.setAttribute('webkit-playsinline', '');
      videoRef.current.setAttribute('x5-playsinline', '');
      videoRef.current.crossOrigin = 'anonymous';
      
      // إضافة معالجات الأحداث قبل تعيين المصدر
      videoRef.current.oncanplay = () => {
        clearTimeout(loadTimeout);
        console.log("يمكن تشغيل الفيديو الآن");
        setIsLoading(false);
      };
      
      videoRef.current.onloadeddata = () => {
        clearTimeout(loadTimeout);
        console.log("تم تحميل بيانات الفيديو");
        
        // تحديث الحالة بعد تأخير قصير للسماح بإكمال التهيئة
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      };
      
      videoRef.current.onplaying = () => {
        clearTimeout(loadTimeout);
        console.log("بدأ تشغيل الفيديو");
        setIsLoading(false);
      };
      
      // إعادة تعيين معالج الأخطاء مع معلومات مفصلة
      videoRef.current.onerror = (e) => {
        clearTimeout(loadTimeout);
        
        // معلومات خطأ أكثر تفصيلاً
        const errorCode = videoRef.current?.error?.code || 0;
        const errorMsg = videoRef.current?.error?.message || 'خطأ غير معروف';
        console.error(`خطأ في تحميل الفيديو: رمز الخطأ: ${errorCode}, الرسالة: ${errorMsg}`);
        
        // رسائل مخصصة حسب نوع الخطأ
        let userFriendlyError = "حدث خطأ أثناء تحميل الفيديو";
        
        switch (errorCode) {
          case 1: // MEDIA_ERR_ABORTED
            userFriendlyError = "تم إلغاء تحميل الفيديو";
            break;
          case 2: // MEDIA_ERR_NETWORK
            userFriendlyError = "حدث خطأ في الشبكة، تحقق من اتصالك بالإنترنت";
            break;
          case 3: // MEDIA_ERR_DECODE
            userFriendlyError = "لا يمكن تشغيل الفيديو، تنسيق غير مدعوم";
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            userFriendlyError = "مصدر الفيديو غير مدعوم";
            break;
        }
        
        setError(userFriendlyError);
        setIsLoading(false);
      };
      
      // إعداد المصدر
      if (setupVideoSource(videoRef.current, channel.streamUrl)) {
        console.log("تم إعداد مصدر الفيديو بنجاح");
        
        // محاولة التشغيل مع خيارات بديلة
        setTimeout(() => {
          if (!videoRef.current) {
            clearTimeout(loadTimeout);
            return;
          }
          
          try {
            // محاولة التشغيل المباشرة
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise.then(() => {
                clearTimeout(loadTimeout);
                console.log("تم تشغيل الفيديو بنجاح");
                setIsLoading(false);
              }).catch(err => {
                console.error("خطأ في التشغيل:", err.name, err.message);
                
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
                          const unmuteOnClick = () => {
                            if (videoRef.current) {
                              videoRef.current.muted = false;
                              setError(null);
                            }
                            document.removeEventListener('click', unmuteOnClick);
                          };
                          document.addEventListener('click', unmuteOnClick, { once: true });
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
                  let errorMessage = 'فشل في تشغيل البث، تحقق من اتصالك بالإنترنت';
                  
                  if (err.name === "AbortError") {
                    errorMessage = 'تم إلغاء تحميل الفيديو، حاول مرة أخرى';
                  }
                  
                  setError(errorMessage);
                  setIsLoading(false);
                }
              });
            } else {
              console.warn("تعذر بدء التشغيل (play() لم يرجع وعدًا)");
            }
          } catch (e) {
            clearTimeout(loadTimeout);
            console.error("خطأ عام في التشغيل:", e);
            setError('حدث خطأ غير متوقع أثناء محاولة تشغيل الفيديو');
            setIsLoading(false);
          }
        }, 700);
      } else {
        clearTimeout(loadTimeout);
        setError("فشل في إعداد مصدر الفيديو");
        setIsLoading(false);
      }
    } catch (err) {
      clearTimeout(loadTimeout);
      console.error("خطأ في تهيئة الفيديو:", err);
      setError("حدث خطأ أثناء تحميل الفيديو");
      setIsLoading(false);
    }
    
    // تنظيف المؤقت عند الخروج من الوظيفة
    return () => {
      clearTimeout(loadTimeout);
    };
  };

  return { initializeVideoPlayback };
}
