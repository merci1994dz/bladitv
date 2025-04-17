
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCategories, getCountries, getRecentlyWatchedChannels } from '@/services/api';
import { playChannel, toggleFavoriteChannel } from '@/services/channelService';
import { Channel } from '@/types';
import LoadingIndicator from '@/components/LoadingIndicator';
import RecentlyWatchedChannels from '@/components/recently-watched/RecentlyWatchedChannels';
import CategoryTabs from '@/components/home/CategoryTabs';
import HomeSync from '@/components/home/HomeSync';
import { useToast } from '@/hooks/use-toast';
import { Menu, Search, Bell } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const { isOffline, networkStatus } = useNetworkStatus();

  const { 
    data: channels,
    isLoading: isLoadingChannels,
    refetch: refetchChannels,
    error: channelsError
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    // تحسين: إضافة إدارة الأخطاء
    retry: 3,
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
    playChannel(channel.id)
      .then(() => {
        // تحسين: إضافة إشعار نجاح
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

  // معالجة تبديل قناة كمفضلة
  const handleToggleFavorite = (channelId: string) => {
    toggleFavoriteChannel(channelId)
      .then(isFavorite => {
        // تحسين: إضافة إشعار تأكيد
        toast({
          title: isFavorite ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
          description: isFavorite ? "تمت إضافة القناة إلى المفضلة" : "تمت إزالة القناة من المفضلة",
          duration: 2000,
        });
      })
      .catch(console.error);
  };

  const filteredChannels = channels?.filter(channel => {
    if (selectedCategory === 'all') return true;
    return channel.category === selectedCategory;
  }) || [];

  // تحسين: تحسين شاشة التحميل
  if (isLoadingChannels || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <LoadingIndicator size="large" text="جاري تحميل القنوات..." />
      </div>
    );
  }

  // تحسين: عرض رسالة خطأ إذا كان هناك مشكلة في تحميل القنوات
  if (channelsError && !channels?.length) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center flex-col gap-4">
        <div className="text-red-500 text-xl font-bold">تعذر تحميل القنوات</div>
        <div className="text-gray-400">يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</div>
        <button 
          onClick={() => refetchChannels()} 
          className="bg-primary text-white px-4 py-2 rounded-md mt-4 hover:bg-primary/80 transition-colors"
        >
          إعادة المحاولة
        </button>
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
          {/* تحسين: إضافة مؤشر حالة الاتصال */}
          <div className={`h-2 w-2 rounded-full mr-2 ${networkStatus.hasInternet ? 'bg-green-500' : 'bg-red-500'}`} 
               title={networkStatus.hasInternet ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'} />
          <HomeSync refetchChannels={refetchChannels} />
          <button className="tv-icon-button">
            <Bell size={20} />
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
