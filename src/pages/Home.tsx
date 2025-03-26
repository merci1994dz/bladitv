
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCategories, getCountries, getRecentlyWatchedChannels } from '@/services/api';
import { playChannel, toggleFavoriteChannel } from '@/services/channelService';
import { Channel } from '@/types';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import LoadingIndicator from '@/components/LoadingIndicator';
import HomeHeader from '@/components/header/HomeHeader';
import RecentlyWatchedChannels from '@/components/recently-watched/RecentlyWatchedChannels';
import HomeTitleSection from '@/components/home/HomeTitleSection';
import CategoryTabs from '@/components/home/CategoryTabs';
import { Menu, RefreshCw, Bell, Search } from 'lucide-react';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { 
    data: channels,
    isLoading: isLoadingChannels,
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
  });

  const { 
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    data: countries,
    isLoading: isLoadingCountries
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  const { 
    data: recentlyWatched,
    isLoading: isLoadingRecent
  } = useQuery({
    queryKey: ['recentlyWatched'],
    queryFn: getRecentlyWatchedChannels,
  });

  // معالجة تشغيل قناة
  const handlePlayChannel = (channel: Channel) => {
    playChannel(channel.id).catch(console.error);
  };

  // معالجة تبديل قناة كمفضلة
  const handleToggleFavorite = (channelId: string) => {
    toggleFavoriteChannel(channelId).catch(console.error);
  };

  const filteredChannels = channels?.filter(channel => {
    if (selectedCategory === 'all') return true;
    return channel.category === selectedCategory;
  }) || [];

  // إظهار مؤشر التحميل أثناء تحميل البيانات
  if (isLoadingChannels || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <LoadingIndicator size="large" text="جاري تحميل القنوات..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* شريط العنوان */}
      <div className="tv-header">
        <div className="flex items-center">
          <button className="tv-icon-button mr-2">
            <Menu size={24} />
          </button>
          <h1 className="tv-header-title">Genral TV</h1>
        </div>
        <div className="tv-header-actions">
          <button className="tv-icon-button">
            <Bell size={20} />
          </button>
          <button className="tv-icon-button">
            <RefreshCw size={20} />
          </button>
          <button className="tv-icon-button">
            <Search size={20} />
          </button>
        </div>
      </div>
      
      {/* علامات التبويب والقنوات */}
      <CategoryTabs 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        filteredChannels={filteredChannels}
        countries={countries}
        onPlayChannel={handlePlayChannel}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
};

export default Home;
