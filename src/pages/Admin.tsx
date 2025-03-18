
import React from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminLoading from '@/components/admin/AdminLoading';
import AdminContent from '@/components/admin/AdminContent';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Admin: React.FC = () => {
  const {
    isAuthenticated,
    hasFullAccessEnabled,
    setHasFullAccessEnabled,
    isLoading,
    handleLoginSuccess,
    handleLogout
  } = useAdminAuth();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return <AdminLoading />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Show admin dashboard if authenticated
  return (
    <AdminContent
      hasFullAccessEnabled={hasFullAccessEnabled}
      setHasFullAccessEnabled={setHasFullAccessEnabled}
      handleLogout={handleLogout}
    />
  );
};

export default Admin;
