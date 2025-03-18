
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCountries, getCategories } from '@/services/api';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import ChannelsTab from '@/components/admin/ChannelsTab';
import SettingsTab from '@/components/admin/SettingsTab';
import CountriesTab from '@/components/admin/CountriesTab'; 
import DashboardStats from '@/components/admin/DashboardStats';
import FullAccessToggle from './FullAccessToggle';
import FullAccessMessage from './FullAccessMessage';
import { getLastSyncTime } from '@/services/sync';

interface AdminContentProps {
  hasFullAccessEnabled: boolean;
  setHasFullAccessEnabled: (value: boolean) => void;
  handleLogout: () => void;
}

const AdminContent: React.FC<AdminContentProps> = ({ 
  hasFullAccessEnabled, 
  setHasFullAccessEnabled,
  handleLogout 
}) => {
  const [activeTab, setActiveTab] = useState<string>('channels');

  // Query hooks for fetching data
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

  const isLoadingData = isLoadingChannels || isLoadingCountries || isLoadingCategories;

  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      <AdminHeader />
      
      <FullAccessToggle 
        hasFullAccessEnabled={hasFullAccessEnabled}
        setHasFullAccessEnabled={setHasFullAccessEnabled}
      />
      
      <FullAccessMessage hasFullAccessEnabled={hasFullAccessEnabled} />
      
      {isLoadingData ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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

export default AdminContent;
