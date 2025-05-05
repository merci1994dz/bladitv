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
import { Menu, Search, Bell, RefreshCw } from 'lucide-react';
import { useConnectivityContext } from '@/components/connectivity/ConnectivityProvider';
import { OfflineMode, NetworkStatusBar } from '@/components/connectivity';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const { 
    isOnline, 
    connectionType, 
    checkStatus,
    isChecking
  } = useConnectivityContext();
  const isOffline = !isOnline;

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

  // Handle retry connection
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

  // تحسين: تحسين شاشة التحميل
  if (isLoadingChannels) {
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
          <h1 className="tv-header-title">Bladi TV</h1>
        </div>
        <div className="tv-header-actions">
          {/* مؤشر حالة الاتصال المحسن */}
          <NetworkStatusBar compact={true} onRefresh={handleRetryConnection} />
          <HomeSync refetchChannels={refetchChannels} />
          <button className="tv-icon-button">
            <Bell size={20} />
          </button>
          <button className="tv-icon-button">
            <Search size={20} />
          </button>
        </div>
      </div>
      
      {/* عرض إشعار عدم الاتصال إذا لزم الأمر */}
      {isOffline && (
        <div className="px-4 pt-2">
          <OfflineMode 
            isOffline={isOffline} 
            onReconnect={handleRetryConnection}
            hasLocalData={channels && channels.length > 0}
          />
        </div>
      )}
      
      {/* عرض إشعار الاتصال المحدود إذا لزم الأمر */}
      {!isOffline && connectionType === 'limited' && channels && (
        <div className="bg-amber-500/10 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md p-2 mx-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-700 dark:text-amber-300">
              متصل بالإنترنت لكن تعذر الوصول إلى مصادر البيانات. يتم عرض البيانات المخزنة محليًا.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryConnection}
              className="bg-background/80 text-xs h-7"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      )}
      
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
