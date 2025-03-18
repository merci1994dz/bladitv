
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verifyAdminSession, logoutAdmin, hasFullAccess } from '@/services/adminService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasFullAccessEnabled, setHasFullAccessEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { isOffline } = useNetworkStatus();

  // التحقق من حالة المصادقة عند تحميل المكون
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // إذا كان المستخدم غير متصل، نعتمد على حالة المصادقة المخزنة محلياً
        if (isOffline) {
          const cachedAuth = localStorage.getItem('admin_auth_state');
          if (cachedAuth) {
            const authState = JSON.parse(cachedAuth);
            setIsAuthenticated(authState.isAuthenticated);
            setHasFullAccessEnabled(authState.hasFullAccess);
            
            if (authState.isAuthenticated) {
              toast({
                title: "وضع غير متصل",
                description: "أنت تستخدم وضع المسؤول دون اتصال. بعض الميزات قد تكون محدودة.",
                variant: "default", // Changed from "warning" to "default"
              });
            }
          }
        } else {
          const isValid = verifyAdminSession();
          setIsAuthenticated(isValid);
          setHasFullAccessEnabled(hasFullAccess());
          
          // تخزين حالة المصادقة محلياً للاستخدام عند عدم الاتصال
          localStorage.setItem('admin_auth_state', JSON.stringify({
            isAuthenticated: isValid,
            hasFullAccess: hasFullAccess(),
            timestamp: Date.now()
          }));
          
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
  }, [toast, isOffline]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setHasFullAccessEnabled(hasFullAccess());
    
    // تحديث حالة المصادقة المخزنة
    localStorage.setItem('admin_auth_state', JSON.stringify({
      isAuthenticated: true,
      hasFullAccess: hasFullAccess(),
      timestamp: Date.now()
    }));
    
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "أهلاً بك في لوحة الإدارة",
    });
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setHasFullAccessEnabled(false);
    
    // مسح حالة المصادقة المخزنة
    localStorage.removeItem('admin_auth_state');
    
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
