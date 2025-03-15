
import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import SettingsTab from '@/components/admin/SettingsTab';
import { useToast } from '@/hooks/use-toast';
import { verifyAdminSession, logoutAdmin } from '@/services/adminService';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('channels');
  const { toast } = useToast();

  // التحقق من حالة المصادقة عند تحميل المكون
  useEffect(() => {
    const checkAuth = () => {
      const isValid = verifyAdminSession();
      setIsAuthenticated(isValid);
      
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
    };
    
    checkAuth();
  }, [toast]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_authenticated', 'true');
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "أهلاً بك في لوحة الإدارة",
    });
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
  };

  // عرض شاشة تسجيل الدخول إذا لم يتم المصادقة
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // عرض لوحة الإدارة إذا تم المصادقة
  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      <AdminHeader />
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'settings' && <SettingsTab />}
      
      <div className="mt-12 text-center">
        <button 
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Admin;
