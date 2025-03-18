
import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminLoading from '@/components/admin/AdminLoading';
import AdminContent from '@/components/admin/AdminContent';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Admin: React.FC = () => {
  // استخدام hook المصادقة المخصص
  const { 
    isAuthenticated, 
    hasFullAccessEnabled, 
    isLoading, 
    handleLoginSuccess, 
    handleLogout,
    setHasFullAccessEnabled 
  } = useAdminAuth();
  
  // استخدام hook حالة الشبكة
  const { isOffline, networkStatus, retryConnection } = useNetworkStatus();
  
  const [activeTab, setActiveTab] = useState<string>('channels');
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);

  // إظهار تنبيه الشبكة عند انقطاع الاتصال أو عند فقدان الوصول للخادم
  useEffect(() => {
    if (isOffline || (networkStatus.hasInternet && !networkStatus.hasServerAccess)) {
      setShowNetworkAlert(true);
    } else {
      // إخفاء التنبيه بعد فترة قصيرة إذا تم استعادة الاتصال
      const timeout = setTimeout(() => {
        setShowNetworkAlert(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [isOffline, networkStatus]);

  // عرض مؤشر التحميل أثناء فحص حالة المصادقة
  if (isLoading) {
    return <AdminLoading />;
  }

  // عرض شاشة تسجيل الدخول إذا لم يتم المصادقة
  if (!isAuthenticated) {
    return (
      <>
        {showNetworkAlert && (
          <div className="fixed top-0 left-0 right-0 z-50 p-2">
            <Alert variant={isOffline ? "destructive" : "warning"} className="animate-in">
              <div className="flex items-center">
                {isOffline ? <WifiOff className="h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
                <AlertTitle>
                  {isOffline ? "أنت غير متصل بالإنترنت" : "اتصال محدود بالخادم"}
                </AlertTitle>
              </div>
              <AlertDescription className="flex justify-between items-center mt-2">
                <span>
                  {isOffline 
                    ? "لن تتمكن من تسجيل الدخول في وضع عدم الاتصال إلا إذا كنت قد سجلت الدخول مسبقًا." 
                    : "قد تكون بعض الميزات محدودة بسبب مشكلات في الاتصال بالخادم."}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => retryConnection()}
                  className="ml-2 whitespace-nowrap"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span>إعادة الاتصال</span>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // عرض لوحة الإدارة إذا تم المصادقة
  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      {showNetworkAlert && (
        <Alert variant={isOffline ? "destructive" : "warning"} className="mb-4 animate-in">
          <div className="flex items-center">
            {isOffline ? <WifiOff className="h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
            <AlertTitle>
              {isOffline ? "وضع عدم الاتصال" : "اتصال محدود بالخادم"}
            </AlertTitle>
          </div>
          <AlertDescription className="flex justify-between items-center mt-2">
            <span>
              {isOffline 
                ? "أنت تستخدم لوحة الإدارة في وضع عدم الاتصال. لن تتمكن من إجراء تغييرات على البيانات." 
                : "لا يمكن الوصول إلى بعض موارد الخادم. قد تكون بعض الميزات غير متاحة."}
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => retryConnection()}
              className="ml-2 whitespace-nowrap"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              <span>إعادة الاتصال</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <AdminContent 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        hasFullAccessEnabled={hasFullAccessEnabled}
        setHasFullAccessEnabled={setHasFullAccessEnabled}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default Admin;
