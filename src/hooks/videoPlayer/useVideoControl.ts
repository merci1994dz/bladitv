
import { useState } from 'react';
import { VideoRef } from './useVideoSetup';
import { toast } from "@/hooks/use-toast";

export function useVideoControl({ 
  videoRef,
  setIsLoading,
  setError 
}: { 
  videoRef: VideoRef; 
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * تبديل التشغيل/الإيقاف
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    console.log("تبديل التشغيل/الإيقاف. الحالة الحالية: / Toggling play/pause. Current state:", isPlaying ? "يعمل / playing" : "متوقف / paused");
    
    if (isPlaying) {
      try {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log("تم إيقاف الفيديو بنجاح / Video paused successfully");
      } catch (e) {
        console.error("خطأ في إيقاف الفيديو: / Error pausing video:", e);
      }
    } else {
      try {
        // إعادة تعيين رسالة الخطأ قبل التشغيل
        // Reset error message before playing
        setError(null);
        
        // التأكد من تعيين playsInline للأجهزة المحمولة
        // Make sure to set playsInline for mobile devices
        videoRef.current.playsInline = true;
        
        // للأجهزة المحمولة، قد نحتاج إلى كتم الصوت مؤقتًا للتشغيل
        // For mobile devices, we may need to temporarily mute for playback
        const wasMuted = videoRef.current.muted;
        let needsUnmute = false;
        
        if (videoRef.current.paused && !wasMuted) {
          try {
            // محاولة التشغيل أولاً بدون كتم الصوت
            // Try playing first without muting
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("بدأ تشغيل الفيديو / Video playback started");
                  setIsPlaying(true);
                })
                .catch(err => {
                  // إذا فشل بسبب قيود التشغيل التلقائي، حاول مع كتم الصوت
                  // If it fails due to autoplay restrictions, try with muted
                  if (err.name === "NotAllowedError") {
                    console.log("محاولة التشغيل مع كتم الصوت... / Trying playback with muted audio...");
                    videoRef.current!.muted = true;
                    needsUnmute = true;
                    
                    // محاولة أخرى مع كتم الصوت
                    // Another attempt with muted audio
                    videoRef.current!.play()
                      .then(() => {
                        console.log("تم تشغيل الفيديو بنجاح مع كتم الصوت / Video played successfully with muted audio");
                        setIsPlaying(true);
                        
                        // إلغاء كتم الصوت بعد التشغيل بنجاح
                        // Unmute after successful playback
                        setTimeout(() => {
                          if (videoRef.current && needsUnmute) {
                            videoRef.current.muted = false;
                            console.log("تم إلغاء كتم الصوت بعد التشغيل بنجاح / Unmuted after successful playback");
                          }
                        }, 500);
                      })
                      .catch(muteErr => {
                        console.error('فشل التشغيل حتى مع كتم الصوت: / Playback failed even with muted audio:', muteErr);
                        setError('تعذر تشغيل الفيديو. حاول مرة أخرى. / Could not play video. Please try again.');
                      });
                  } else {
                    console.error('خطأ عام في التشغيل: / General playback error:', err);
                    setError(`فشل في تشغيل الفيديو: ${err.message || 'خطأ غير معروف'} / Failed to play video: ${err.message || 'Unknown error'}`);
                  }
                });
            }
          } catch (error) {
            console.error('خطأ عام في محاولة التشغيل: / General error in playback attempt:', error);
            setError('فشل في تشغيل البث. حاول مرة أخرى. / Failed to play stream. Please try again.');
          }
        } else {
          // إذا كان الفيديو بالفعل مكتوم الصوت، فقط قم بالتشغيل
          // If video is already muted, just play
          try {
            videoRef.current.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch(err => {
                console.error('خطأ في التشغيل: / Error in playback:', err);
                setError('فشل في تشغيل البث / Failed to play stream');
              });
          } catch (error) {
            console.error('خطأ عام: / General error:', error);
            setError('فشل في تشغيل البث. حاول مرة أخرى. / Failed to play stream. Please try again.');
          }
        }
      } catch (error) {
        console.error('خطأ عام في محاولة التشغيل: / General error in playback attempt:', error);
        setError('فشل في تشغيل البث. حاول مرة أخرى. / Failed to play stream. Please try again.');
      }
    }
  };
  
  /**
   * وظيفة البحث في الفيديو
   * Video seek function
   */
  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      try {
        videoRef.current.currentTime += seconds;
      } catch (error) {
        console.error('خطأ في البحث في الفيديو: / Error seeking video:', error);
        // العديد من البث المباشر لا يدعم البحث، لذا تجاهل الخطأ فقط
        // Many live streams don't support seeking, so just ignore the error
      }
    }
  };
  
  /**
   * وظائف البحث للأمام والخلف
   * Forward and backward seek functions
   */
  const seekForward = () => seekVideo(10);
  const seekBackward = () => seekVideo(-10);

  return {
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    seekVideo,
    seekForward,
    seekBackward
  };
}
