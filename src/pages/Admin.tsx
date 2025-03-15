
import React, { useState } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('channels');

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      <AdminHeader />
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Admin;
