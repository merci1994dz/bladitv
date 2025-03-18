
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

  // Show loading indicator while loading data
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-4 pb-20">
        <HomeHeader />
        
        <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
          <HomeTitleSection refetchChannels={refetchChannels} />
          <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl">
            <AdvancedSearch className="mb-2" />
          </div>
        </div>
        
        {/* Recently watched channels */}
        {recentlyWatched && recentlyWatched.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-background p-4 rounded-xl shadow-sm">
            <RecentlyWatchedChannels 
              channels={recentlyWatched} 
              isLoading={isLoadingRecent}
              onChannelClick={handlePlayChannel} 
            />
          </div>
        )}

        {/* Category tabs */}
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
    </div>
  );
};

export default Home;
