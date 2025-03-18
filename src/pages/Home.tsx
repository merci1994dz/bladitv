
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

  // Handle playing a channel
  const handlePlayChannel = (channel: Channel) => {
    playChannel(channel.id).catch(console.error);
  };

  // Handle toggling a channel as favorite
  const handleToggleFavorite = (channelId: string) => {
    toggleFavoriteChannel(channelId).catch(console.error);
  };

  const filteredChannels = channels?.filter(channel => {
    if (selectedCategory === 'all') return true;
    return channel.category === selectedCategory;
  }) || [];

  // عرض مؤشر التحميل أثناء تحميل البيانات
  if (isLoadingChannels || isLoadingCategories) {
    return (
      <div className="container mx-auto px-4 py-8">
        <HomeHeader />
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingIndicator size="large" text="جاري تحميل القنوات..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-20">
      <HomeHeader />
      
      <div className="mb-4">
        <HomeTitleSection refetchChannels={refetchChannels} />
        <AdvancedSearch className="mb-6" />
      </div>
      
      {/* القنوات المشاهدة مؤخرًا */}
      {recentlyWatched && recentlyWatched.length > 0 && (
        <div className="mb-8">
          <RecentlyWatchedChannels 
            channels={recentlyWatched} 
            isLoading={isLoadingRecent}
            onChannelClick={handlePlayChannel} 
          />
        </div>
      )}

      {/* تبويبات الفئات */}
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
