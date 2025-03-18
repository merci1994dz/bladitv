
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // جلب بيانات القنوات والدول والفئات
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    enabled: isAuthenticated
  });

  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    enabled: isAuthenticated
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isAuthenticated
  });

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
  
  // وظيفة جديدة للتحكم في الصلاحيات الكاملة
  const toggleFullAccess = () => {
    try {
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
    } catch (error) {
      console.error("Error toggling full access:", error);
      toast({
        title: "خطأ في تغيير الصلاحيات",
        description: "حدث خطأ أثناء محاولة تغيير صلاحيات المسؤول",
        variant: "destructive",
      });
    }
  };

  // عرض مؤشر التحميل أثناء فحص حالة المصادقة
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4 flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  // عرض شاشة تسجيل الدخول إذا لم يتم المصادقة
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const isLoadingData = isLoadingChannels || isLoadingCountries || isLoadingCategories;

  // عرض لوحة الإدارة إذا تم المصادقة
  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      <AdminHeader />
      
      {/* زر تفعيل الصلاحيات الكاملة */}
      <div className="flex justify-center my-4">
        <Button
          onClick={toggleFullAccess}
          variant={hasFullAccessEnabled ? "destructive" : "default"}
          className="flex items-center gap-2 transform hover:scale-105 transition-all duration-300 shadow-md"
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
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md p-3 mb-4 text-center animate-pulse">
          <div className="flex justify-center items-center gap-2 mb-1 text-green-600 dark:text-green-400">
            <Shield className="h-5 w-5" />
            <span className="font-bold">الصلاحيات الكاملة مفعلة</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">تم تفعيل صلاحيات المسؤول الكاملة. لا يلزم إعادة تسجيل الدخول لمدة 6 أشهر.</p>
        </div>
      )}
      
      {/* عرض مؤشر التحميل أثناء جلب البيانات */}
      {isLoadingData ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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
        </>
      )}
      
      <div className="mt-12 text-center">
        <button 
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline transition-all"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Admin;
