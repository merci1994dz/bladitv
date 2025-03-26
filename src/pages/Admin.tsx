
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { forceDataRefresh } from '@/services/sync/forceRefresh';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, RefreshCw } from 'lucide-react';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('channels');
  const [hasFullAccessEnabled, setHasFullAccessEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] = useState<string>('');
  const { toast } = useToast();

  // جلب بيانات القنوات والدول والفئات
  const { data: channels, isLoading: isLoadingChannels, refetch: refetchChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  const { data: countries, isLoading: isLoadingCountries, refetch: refetchCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  const { data: categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  // وظيفة لإجبار إعادة تحميل البيانات
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      toast({
        title: "جاري إعادة تحميل البيانات",
        description: "جاري مسح ذاكرة التخزين المؤقت وإعادة تحميل البيانات الجديدة...",
      });
      
      // تنفيذ تحديث قسري للبيانات
      await forceDataRefresh();
      
      // إعادة جلب البيانات بعد التحديث
      await Promise.all([
        refetchChannels(),
        refetchCountries(),
        refetchCategories()
      ]);
      
      // تحديث معلومات الإصدار
      updateVersionInfo();
      
      toast({
        title: "تم إعادة التحميل بنجاح",
        description: "تم تحديث البيانات بنجاح وعرض أحدث إصدار",
      });
    } catch (error) {
      console.error("خطأ في إعادة تحميل البيانات:", error);
      toast({
        title: "خطأ في إعادة التحميل",
        description: "حدث خطأ أثناء محاولة إعادة تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // تحديث معلومات الإصدار
  const updateVersionInfo = useCallback(() => {
    try {
      const lastSync = getLastSyncTime();
      const dataVersion = localStorage.getItem('data_version');
      const lastUpdateCheck = localStorage.getItem('last_update_check');
      
      let versionText = `الإصدار: ${dataVersion || 'غير معروف'}`;
      if (lastSync) {
        versionText += ` | آخر تحديث: ${new Date(lastSync).toLocaleString()}`;
      }
      if (lastUpdateCheck) {
        const checkTime = new Date(parseInt(lastUpdateCheck)).toLocaleString();
        versionText += ` | آخر فحص: ${checkTime}`;
      }
      
      setVersionInfo(versionText);
    } catch (e) {
      console.error("خطأ في تحديث معلومات الإصدار:", e);
      setVersionInfo('معلومات الإصدار غير متاحة');
    }
  }, []);

  // التحقق من حالة المصادقة عند تحميل المكون
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const isValid = verifyAdminSession();
        setIsAuthenticated(isValid);
        setHasFullAccessEnabled(hasFullAccess());
        if (isValid) {
          updateVersionInfo();
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
  }, [toast, updateVersionInfo]);

  // إضافة مستمع للتخزين المحلي لمراقبة التحديثات
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'data_version' || event.key === 'channels_last_update' || 
          event.key === 'supabase_sync_version' || event.key === 'force_browser_refresh') {
        console.log('تم اكتشاف تغيير في البيانات:', event.key);
        updateVersionInfo();
        // إعادة جلب البيانات تلقائيًا
        refetchChannels();
        refetchCountries();
        refetchCategories();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('app_data_updated', updateVersionInfo);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app_data_updated', updateVersionInfo);
    };
  }, [isAuthenticated, refetchChannels, refetchCountries, refetchCategories, updateVersionInfo]);

  // تحقق دوري من صلاحية الجلسة
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      if (!verifyAdminSession()) {
        setIsAuthenticated(false);
        toast({
          title: "انتهت الجلسة",
          description: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",
          variant: "destructive",
        });
      }
    }, 60000); // التحقق كل دقيقة
    
    return () => clearInterval(interval);
  }, [isAuthenticated, toast]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setHasFullAccessEnabled(hasFullAccess());
    updateVersionInfo();
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "أهلاً بك في لوحة الإدارة",
    });
  }, [toast, updateVersionInfo]);

  const handleLogout = useCallback(() => {
    logoutAdmin();
    setIsAuthenticated(false);
    setHasFullAccessEnabled(false);
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
  }, [toast]);
  
  // وظيفة للتحكم في الصلاحيات الكاملة
  const toggleFullAccess = useCallback(() => {
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
  }, [hasFullAccessEnabled, toast]);

  // حساب حالة تحميل البيانات
  const isLoadingData = useMemo(() => 
    isLoadingChannels || isLoadingCountries || isLoadingCategories, 
    [isLoadingChannels, isLoadingCountries, isLoadingCategories]
  );

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

  // عرض لوحة الإدارة إذا تم المصادقة
  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      <AdminHeader />
      
      {/* معلومات الإصدار وزر التحديث */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
        <p className="text-xs text-muted-foreground mb-2 sm:mb-0 ltr:text-left rtl:text-right">{versionInfo}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
        </Button>
      </div>
      
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
