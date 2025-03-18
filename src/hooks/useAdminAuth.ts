
import { useState, useEffect } from 'react';
import { verifyAdminSession, logoutAdmin, hasFullAccess } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasFullAccessEnabled, setHasFullAccessEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check authentication status on component load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const isValid = verifyAdminSession();
        setIsAuthenticated(isValid);
        setHasFullAccessEnabled(hasFullAccess());
        
        if (isValid) {
          // Set up periodic session validation
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
          }, 60000); // Check every minute
          
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
    setIsAuthenticated,
    hasFullAccessEnabled,
    setHasFullAccessEnabled,
    isLoading,
    handleLoginSuccess,
    handleLogout
  };
};
