
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCountries, toggleFavoriteChannel, getCategories } from '@/services/api';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel, Country, Category } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { Tv, Globe, Grid } from 'lucide-react';

const Home: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);
  const { toast } = useToast();

  const { 
    data: channels, 
    isLoading: isLoadingChannels,
    error: channelsError
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
  });

  const { 
    data: countries,
    isLoading: isLoadingCountries,
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (channels && channels.length > 0) {
      // Select 6 random channels to feature
      const shuffled = [...channels].sort(() => 0.5 - Math.random());
      setFeaturedChannels(shuffled.slice(0, 6));
    }
  }, [channels]);

  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleToggleFavorite = async (channelId: string) => {
    try {
      const updatedChannel = await toggleFavoriteChannel(channelId);
      toast({
        title: updatedChannel.isFavorite ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
        description: `${updatedChannel.name} ${updatedChannel.isFavorite ? 'تمت إضافتها للمفضلة' : 'تمت إزالتها من المفضلة'}`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث المفضلة",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  if (isLoadingChannels || isLoadingCountries || isLoadingCategories) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary font-semibold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (channelsError) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
          <p className="text-xl text-red-600 dark:text-red-400 mb-2">حدث خطأ أثناء تحميل القنوات</p>
          <p className="text-gray-600 dark:text-gray-400">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-primary/80 to-primary rounded-full p-2 mr-2">
              <Tv className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
              بلادي TV
            </h1>
          </div>
        </div>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {/* Featured channels section */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Tv className="h-5 w-5 ml-2 text-primary" />
            <span>قنوات مميزة</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredChannels.map(channel => (
              <ChannelCard 
                key={channel.id} 
                channel={channel} 
                onPlay={handlePlayChannel}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Countries section */}
      <section className="px-4 mb-8 bg-gray-50 dark:bg-gray-800/30 py-6">
        <div className="container mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Globe className="h-5 w-5 ml-2 text-primary" />
            <span>تصفح حسب الدولة</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {countries?.slice(0, 10).map(country => (
              <Link 
                key={country.id} 
                to={`/countries`}
                className="relative bg-gradient-to-t from-black/70 via-black/40 to-black/20 rounded-lg overflow-hidden h-28 group shadow-md hover:shadow-lg transition-all duration-300"
              >
                <img 
                  src={country.image} 
                  alt={country.name}
                  className="absolute inset-0 w-full h-full object-cover z-[-1] transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white font-bold text-center shadow-text px-2">{country.name}</h3>
                </div>
              </Link>
            ))}
            <Link 
              to="/countries"
              className="relative bg-gradient-to-r from-primary/80 to-primary rounded-lg overflow-hidden h-28 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="text-white font-bold text-center">عرض كل الدول</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Grid className="h-5 w-5 ml-2 text-primary" />
            <span>تصفح حسب الفئة</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories?.slice(0, 9).map(category => (
              <Link 
                key={category.id} 
                to={`/categories`}
                className="relative bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10 rounded-lg p-4 flex flex-col items-center justify-center h-24 shadow-sm hover:shadow-md hover:bg-primary/10 transition-all duration-300"
              >
                <div className="text-primary mb-2">{category.icon}</div>
                <h3 className="text-center text-sm font-medium">{category.name}</h3>
              </Link>
            ))}
            <Link 
              to="/categories"
              className="relative bg-gradient-to-r from-primary/80 to-primary rounded-lg p-4 flex items-center justify-center h-24 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="text-white font-bold text-center">عرض كل الفئات</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
