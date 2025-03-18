
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verifyAdminSession, logoutAdmin, hasFullAccess } from '@/services/adminService';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasFullAccessEnabled, setHasFullAccessEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // التحقق من حالة المصادقة عند تحميل المكون
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const isValid = verifyAdminSession();
        setIsAuthenticated(isValid);
        setHasFullAccessEnabled(hasFullAccess());
        
        if (isValid) {
          // تحقق دوري من صلاحية الجلسة
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
        console.error("Error checking authentication:", error);
        toast({
          title: "خطأ في التحقق",
          description: "حدث خطأ أثناء التحقق من جلستك",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [toast]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setHasFullAccessEnabled(hasFullAccess());
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "أهلاً بك في لوحة الإدارة",
    });
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setHasFullAccessEnabled(false);
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
  };

  return {
    isAuthenticated,
    hasFullAccessEnabled,
    isLoading,
    handleLoginSuccess,
    handleLogout,
    setHasFullAccessEnabled
  };
};
