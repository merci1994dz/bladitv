
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCategories, getCountries, getRecentlyWatchedChannels } from '@/services/api';
import { playChannel, toggleFavoriteChannel } from '@/services/channelService';
import { Channel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useConnectivityContext } from '@/components/connectivity/ConnectivityProvider';
import HomeHeader from '@/components/home/HomeHeader';
import HomeContent from '@/components/home/HomeContent';
import HomeConnectivityBanner from '@/components/home/HomeConnectivityBanner';
import { setupSupabaseRealtimeSync } from '@/services/sync/supabase/realtime/realtimeSync';

const Home: React.FC = () => {
  const { toast } = useToast();
  const { checkStatus, isOffline } = useConnectivityContext();

  // Set up realtime sync with Supabase
  useEffect(() => {
    console.log('Setting up realtime sync on Home page');
    const cleanup = setupSupabaseRealtimeSync();
    return () => {
      console.log('Cleaning up realtime sync');
      cleanup();
    };
  }, []);

  const { 
    data: channels,
    isLoading: isLoadingChannels,
    refetch: refetchChannels,
    error: channelsError
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    meta: {
      onError: (error: any) => {
        console.error('خطأ في تحميل القنوات:', error);
        toast({
          title: "تعذر تحميل القنوات",
          description: "حدث خطأ أثناء تحميل القنوات. سيتم استخدام البيانات المخزنة محليًا.",
          variant: "destructive"
        });
      }
    }
  });

  const { 
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const {
    data: countries,
    isLoading: isLoadingCountries
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { 
    data: recentlyWatched,
    isLoading: isLoadingRecent
  } = useQuery({
    queryKey: ['recentlyWatched'],
    queryFn: getRecentlyWatchedChannels,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle connectivity retry
  const handleRetryConnection = async () => {
    toast({
      title: "جاري التحقق من الاتصال",
      description: "جاري محاولة إعادة الاتصال والتحقق من المصادر...",
      duration: 3000,
    });
    
    await checkStatus();
    
    if (!isOffline) {
      refetchChannels();
    }
  };

  // Channel actions
  const handlePlayChannel = (channel: Channel) => {
    playChannel(channel.id)
      .then(() => {
        toast({
          title: "جاري التشغيل",
          description: `جاري تشغيل ${channel.name}`,
          duration: 2000,
        });
      })
      .catch(error => {
        console.error('خطأ في تشغيل القناة:', error);
        toast({
          title: "تعذر تشغيل القناة",
          description: "حدث خطأ أثناء محاولة تشغيل القناة",
          variant: "destructive"
        });
      });
  };

  const handleToggleFavorite = (channelId: string) => {
    toggleFavoriteChannel(channelId)
      .then(isFavorite => {
        toast({
          title: isFavorite ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
          description: isFavorite ? "تمت إضافة القناة إلى المفضلة" : "تمت إزالة القناة من المفضلة",
          duration: 2000,
        });
      })
      .catch(console.error);
  };

  // Initial data load recovery
  useEffect(() => {
    if (channelsError && !channels) {
      console.log("محاولة استعادة البيانات بعد خطأ التحميل الأولي");
      setTimeout(() => {
        refetchChannels();
      }, 3000);
    }
  }, [channelsError, channels, refetchChannels]);

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header section */}
      <HomeHeader 
        refetchChannels={refetchChannels} 
        onRetryConnection={handleRetryConnection} 
      />
      
      {/* Connectivity banners */}
      <HomeConnectivityBanner refetchChannels={refetchChannels} />
      
      {/* Main content */}
      <HomeContent 
        channels={channels}
        categories={categories}
        countries={countries}
        recentlyWatched={recentlyWatched}
        isLoading={isLoadingChannels}
        error={channelsError}
        onPlayChannel={handlePlayChannel}
        onToggleFavorite={handleToggleFavorite}
        refetchChannels={refetchChannels}
      />
    </div>
  );
};

export default Home;
