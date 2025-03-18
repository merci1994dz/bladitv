
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCountries, getCategories } from '@/services/api';
import { getLastSyncTime } from '@/services/sync';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import SettingsTab from '@/components/admin/SettingsTab';
import ChannelsTab from '@/components/admin/ChannelsTab';
import CountriesTab from '@/components/admin/CountriesTab';
import DashboardStats from '@/components/admin/DashboardStats';
import FullAccessToggle from '@/components/admin/FullAccessToggle';

interface AdminContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasFullAccessEnabled: boolean;
  setHasFullAccessEnabled: (value: boolean) => void;
  handleLogout: () => void;
}

const AdminContent: React.FC<AdminContentProps> = ({ 
  activeTab, 
  setActiveTab, 
  hasFullAccessEnabled, 
  setHasFullAccessEnabled, 
  handleLogout 
}) => {
  // جلب بيانات القنوات والدول والفئات
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels
  });

  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // عرض مؤشر التحميل أثناء جلب البيانات
  const isLoadingData = isLoadingChannels || isLoadingCountries || isLoadingCategories;

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <AdminHeader />
      
      <FullAccessToggle 
        hasFullAccessEnabled={hasFullAccessEnabled}
        setHasFullAccessEnabled={setHasFullAccessEnabled}
      />
      
      {/* عرض إحصائيات لوحة التحكم */}
      <DashboardStats 
        channelsCount={channels?.length || 0}
        countriesCount={countries?.length || 0}
        categoriesCount={categories?.length || 0}
        lastSyncTime={getLastSyncTime()}
      />
      
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'channels' && <ChannelsTab />}
      {activeTab === 'countries' && <CountriesTab />}
      {activeTab === 'settings' && <SettingsTab />}
      
      <div className="mt-12 text-center">
        <button 
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline transition-all"
        >
          تسجيل الخروج
        </button>
      </div>
    </>
  );
};

export default AdminContent;
