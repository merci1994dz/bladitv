
import React, { useState } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminLoading from '@/components/admin/AdminLoading';
import AdminContent from '@/components/admin/AdminContent';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';

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
  
  const [activeTab, setActiveTab] = useState<string>('channels');

  // عرض مؤشر التحميل أثناء فحص حالة المصادقة
  if (isLoading) {
    return <AdminLoading />;
  }

  // عرض شاشة تسجيل الدخول إذا لم يتم المصادقة
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // عرض لوحة الإدارة إذا تم المصادقة
  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
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
