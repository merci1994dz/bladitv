
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLogin from '@/components/AdminLogin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import SettingsTab from '@/components/admin/SettingsTab';
import ChannelsTab from '@/components/admin/ChannelsTab';
import DashboardStats from '@/components/admin/DashboardStats';
import { useToast } from '@/hooks/use-toast';
import { getChannels, getCountries, getCategories } from '@/services/api';
import { verifyAdminSession, logoutAdmin } from '@/services/adminService';
import { getLastSyncTime } from '@/services/sync';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('channels');
  const { toast } = useToast();

  // جلب بيانات القنوات والدول والفئات
  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    enabled: isAuthenticated
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    enabled: isAuthenticated
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isAuthenticated
  });

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
      
      {/* عرض إحصائيات لوحة التحكم */}
      <DashboardStats 
        channelsCount={channels?.length || 0}
        countriesCount={countries?.length || 0}
        categoriesCount={categories?.length || 0}
        lastSyncTime={getLastSyncTime()}
      />
      
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'channels' && <ChannelsTab />}
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
