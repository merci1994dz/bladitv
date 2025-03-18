
import { useState, useEffect, useCallback } from 'react';
import { verifyAdminSession, logoutAdmin, hasFullAccess } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasFullAccessEnabled, setHasFullAccessEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // تحقق من حالة المصادقة بطريقة محسنة وأكثر كفاءة
  const checkAuth = useCallback(async () => {
    try {
      const isValid = verifyAdminSession();
      setIsAuthenticated(isValid);
      
      if (isValid) {
        // التحقق من وجود صلاحيات كاملة بعد التأكد من صحة الجلسة
        const hasFullAccessPermission = hasFullAccess();
        setHasFullAccessEnabled(hasFullAccessPermission);
      }
      
      return isValid;
    } catch (error) {
      console.error("خطأ في التحقق من المصادقة:", error);
      return false;
    }
  }, []);

  // التحقق من المصادقة عند تحميل المكون
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const isValid = await checkAuth();
        
        if (isValid) {
          // إعداد التحقق الدوري للجلسة بفترات منتظمة
          const interval = setInterval(() => {
            if (!verifyAdminSession()) {
              setIsAuthenticated(false);
              clearInterval(interval);
              toast({
                title: "انتهت الجلسة",
                description: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",
                variant: "destructive",
              });
            }
          }, 60000); // التحقق كل دقيقة
          
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("خطأ في التحقق الأولي من المصادقة:", error);
        toast({
          title: "خطأ في التحقق",
          description: "حدث خطأ أثناء التحقق من جلستك",
          variant: "destructive",
        });
      } finally {
        // تأخير قصير لتجنب الوميض السريع لشاشة التحميل
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    
    initAuth();
  }, [toast, checkAuth]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setHasFullAccessEnabled(hasFullAccess());
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "أهلاً بك في لوحة الإدارة",
    });
  }, [toast]);

  const handleLogout = useCallback(() => {
    logoutAdmin();
    setIsAuthenticated(false);
    setHasFullAccessEnabled(false);
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
  }, [toast]);

  return {
    isAuthenticated,
    setIsAuthenticated,
    hasFullAccessEnabled,
    setHasFullAccessEnabled,
    isLoading,
    handleLoginSuccess,
    handleLogout,
    checkAuth
  };
};
