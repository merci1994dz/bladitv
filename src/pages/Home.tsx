
import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);

  const { 
    data: channels,
    isLoading: isLoadingChannels,
    refetch: refetchChannels,
    isError: isChannelsError
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching channels:", error);
        toast({
          title: "خطأ في تحميل القنوات",
          description: "حدث خطأ أثناء تحميل القنوات. يرجى المحاولة مرة أخرى لاحقًا.",
          variant: "destructive",
        });
      }
    }
  });

  const { 
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000)
  });

  const {
    data: countries,
    isLoading: isLoadingCountries,
    isError: isCountriesError
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000)
  });

  const { 
    data: recentlyWatched,
    isLoading: isLoadingRecent,
    isError: isRecentError
  } = useQuery({
    queryKey: ['recentlyWatched'],
    queryFn: getRecentlyWatchedChannels,
    retry: 2
  });

  // Manual retry functionality
  const handleRetryLoad = () => {
    setRetryCount(prev => prev + 1);
    refetchChannels();
  };

  // Handle playing a channel
  const handlePlayChannel = (channel: Channel) => {
    playChannel(channel.id).catch(error => {
      console.error("Error playing channel:", error);
      toast({
        title: "خطأ في تشغيل القناة",
        description: "حدث خطأ أثناء محاولة تشغيل القناة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    });
  };

  // Handle toggling a channel as favorite
  const handleToggleFavorite = (channelId: string) => {
    toggleFavoriteChannel(channelId).catch(error => {
      console.error("Error toggling favorite:", error);
      toast({
        title: "خطأ في تحديث المفضلة",
        description: "حدث خطأ أثناء تحديث حالة المفضلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    });
  };

  const filteredChannels = channels?.filter(channel => {
    if (selectedCategory === 'all') return true;
    return channel.category === selectedCategory;
  }) || [];

  const hasError = isChannelsError || isCategoriesError || isCountriesError;

  // Show loading indicator while loading data
  if (isLoadingChannels || isLoadingCategories) {
    return (
      <div className="container mx-auto px-4 py-8">
        <HomeHeader />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingIndicator size="large" text="جاري تحميل القنوات..." />
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <HomeHeader />
        <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 text-center">
          <div className="bg-destructive/10 p-8 rounded-xl flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive mb-4">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="text-xl font-bold mb-2">حدث خطأ في تحميل البيانات</h2>
            <p className="text-muted-foreground mb-4">لم نتمكن من تحميل القنوات حاليًا. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
            <button 
              onClick={handleRetryLoad}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              إعادة المحاولة ({retryCount})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-6 pb-20">
        <HomeHeader />
        
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <HomeTitleSection refetchChannels={refetchChannels} />
          <div className="bg-card/50 backdrop-blur-sm p-5 rounded-xl border-t border-primary/10">
            <AdvancedSearch className="mb-2" />
          </div>
        </div>
        
        {/* Recently watched channels */}
        {recentlyWatched && recentlyWatched.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5 rounded-xl shadow-md">
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
          categories={categories || []}
          filteredChannels={filteredChannels}
          countries={countries || []}
          onPlayChannel={handlePlayChannel}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </div>
  );
};

export default Home;
