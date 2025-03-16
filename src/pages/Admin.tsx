
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
import { verifyAdminSession, logoutAdmin, enableFullAccess, hasFullAccess, disableFullAccess } from '@/services/adminService';
import { getLastSyncTime } from '@/services/sync';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('channels');
  const [hasFullAccessEnabled, setHasFullAccessEnabled] = useState<boolean>(false);
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
  
  // وظيفة جديدة للتحكم في الصلاحيات الكاملة
  const toggleFullAccess = () => {
    if (hasFullAccessEnabled) {
      disableFullAccess();
      setHasFullAccessEnabled(false);
      toast({
        title: "تم إلغاء الصلاحيات الكاملة",
        description: "تم إلغاء وضع المسؤول بصلاحيات كاملة",
      });
    } else {
      enableFullAccess();
      setHasFullAccessEnabled(true);
      toast({
        title: "تم تفعيل الصلاحيات الكاملة",
        description: "تم تمكين وضع المسؤول بصلاحيات كاملة لمدة 6 أشهر",
      });
    }
  };

  // عرض شاشة تسجيل الدخول إذا لم يتم المصادقة
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // عرض لوحة الإدارة إذا تم المصادقة
  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      <AdminHeader />
      
      {/* زر تفعيل الصلاحيات الكاملة */}
      <div className="flex justify-center my-4">
        <Button
          onClick={toggleFullAccess}
          variant={hasFullAccessEnabled ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          {hasFullAccessEnabled ? (
            <>
              <ShieldX className="h-5 w-5" />
              <span>إلغاء الصلاحيات الكاملة</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              <span>تفعيل الصلاحيات الكاملة</span>
            </>
          )}
        </Button>
      </div>
      
      {/* رسالة تنبيه عند تفعيل الصلاحيات الكاملة */}
      {hasFullAccessEnabled && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md p-3 mb-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-1 text-green-600 dark:text-green-400">
            <Shield className="h-5 w-5" />
            <span className="font-bold">الصلاحيات الكاملة مفعلة</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">تم تفعيل صلاحيات المسؤول الكاملة. لا يلزم إعادة تسجيل الدخول لمدة 6 أشهر.</p>
        </div>
      )}
      
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
