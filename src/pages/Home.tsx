
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCategories, getCountries, getRecentlyWatchedChannels } from '@/services/api';
import { syncWithBladiInfo } from '@/services/sync';
import { playChannel, toggleFavoriteChannel } from '@/services/channelService';
import { Channel } from '@/types';
import ChannelsList from '@/components/channel/ChannelsList';
import HomeHeader from '@/components/header/HomeHeader';
import RecentlyWatchedChannels from '@/components/recently-watched/RecentlyWatchedChannels';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import LoadingIndicator from '@/components/LoadingIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // تحديث صفحة البحث
  const handleOpenSearch = () => {
    navigate('/advanced');
  };

  // مزامنة القنوات مع مصادر BLADI
  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      toast({
        title: "جاري المزامنة",
        description: "جاري جلب أحدث القنوات من المصادر الخارجية..."
      });
      
      const result = await syncWithBladiInfo(true);
      
      if (result) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث القنوات بنجاح"
        });
        
        // إعادة تحميل القنوات
        await refetchChannels();
      } else {
        toast({
          title: "تعذرت المزامنة",
          description: "لم يتم العثور على تحديثات جديدة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("خطأ في المزامنة:", error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر الاتصال بمصادر البيانات الخارجية",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">جميع القنوات</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenSearch}
              className="flex items-center gap-1"
            >
              <Search className="h-4 w-4" />
              <span>بحث متقدم</span>
            </Button>
          </div>
        </div>
        
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
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto py-1 px-1 gap-1">
          <TabsTrigger value="all" className="rounded-md">جميع القنوات</TabsTrigger>
          {categories?.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="rounded-md"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedCategory} className="mt-0">
          <ChannelsList 
            channels={filteredChannels}
            countries={countries || []}
            activeCountry={null}
            isLoading={false}
            onPlayChannel={handlePlayChannel}
            onToggleFavorite={handleToggleFavorite}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
