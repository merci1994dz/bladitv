
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCountries, toggleFavoriteChannel, getCategories } from '@/services/api';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel, Country, Category } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { Tv, Globe, Grid, Zap, Star, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary font-semibold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (channelsError) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-b from-background to-muted/30">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-xl shadow-xl border border-red-200 dark:border-red-800 animate-fade-in">
          <p className="text-2xl text-red-600 dark:text-red-400 mb-3 font-bold">حدث خطأ أثناء تحميل القنوات</p>
          <p className="text-gray-600 dark:text-gray-400">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-gradient-to-b from-background to-muted/10">
      {/* شريط العنوان المحسن */}
      <header className="bg-gradient-to-r from-primary/20 to-primary/5 py-4 mb-6 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-full p-3 mr-3 shadow-md">
              <Tv className="text-white h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
              بلادي TV
            </h1>
          </div>
          <p className="text-center text-muted-foreground mt-2 text-sm">شاهد أفضل القنوات العربية والعالمية</p>
        </div>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {/* قسم القنوات الرائجة بتصميم جديد */}
      <section className="px-4 mb-10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center group">
              <Zap className="h-6 w-6 ml-2 text-amber-500 group-hover:animate-pulse transition-all" />
              <span className="bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">قنوات رائجة</span>
            </h2>
            <Link 
              to="/categories" 
              className="text-primary flex items-center text-sm hover:text-primary/80 transition-colors"
            >
              عرض المزيد
              <ArrowRight className="h-4 w-4 mr-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
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

      {/* قسم البلدان بتصميم جديد */}
      <section className="px-4 mb-10 py-10 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/10 dark:to-purple-900/10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center group">
              <Globe className="h-6 w-6 ml-2 text-blue-500 group-hover:animate-spin-slow transition-all" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">تصفح حسب الدولة</span>
            </h2>
            <Link 
              to="/countries" 
              className="text-primary flex items-center text-sm hover:text-primary/80 transition-colors"
            >
              عرض كل الدول
              <ArrowRight className="h-4 w-4 mr-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {countries?.slice(0, 10).map(country => (
              <Link 
                key={country.id} 
                to={`/countries`}
                className="relative overflow-hidden h-32 group rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>
                <img 
                  src={country.image} 
                  alt={country.name}
                  className="absolute inset-0 w-full h-full object-cover z-[-1] transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white font-bold text-xl text-center shadow-text px-2 transform transition-transform duration-300 group-hover:scale-110">{country.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* قسم الفئات بتصميم جديد */}
      <section className="px-4 mb-10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center group">
              <Grid className="h-6 w-6 ml-2 text-green-500 group-hover:rotate-12 transition-all" />
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">تصفح حسب الفئة</span>
            </h2>
            <Link 
              to="/categories" 
              className="text-primary flex items-center text-sm hover:text-primary/80 transition-colors"
            >
              عرض كل الفئات
              <ArrowRight className="h-4 w-4 mr-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {categories?.slice(0, 10).map(category => (
              <Link 
                key={category.id} 
                to={`/categories`}
                className="relative bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 border border-green-100 dark:border-green-900/20 rounded-xl p-4 flex flex-col items-center justify-center h-28 shadow-md hover:shadow-lg hover:border-green-300 dark:hover:border-green-700/40 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="text-green-500 mb-3 text-3xl group-hover:scale-110 transition-transform">{category.icon}</div>
                <h3 className="text-center text-sm font-medium group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* قسم أعلى القنوات تقييماً - قسم جديد */}
      <section className="px-4 mb-10 py-10 bg-gradient-to-r from-amber-100/50 to-orange-100/50 dark:from-amber-900/10 dark:to-orange-900/10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center group">
              <Star className="h-6 w-6 ml-2 text-amber-500 group-hover:animate-pulse transition-all" />
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">أعلى القنوات تقييماً</span>
            </h2>
            <Link 
              to="/categories" 
              className="text-primary flex items-center text-sm hover:text-primary/80 transition-colors"
            >
              عرض المزيد
              <ArrowRight className="h-4 w-4 mr-1" />
            </Link>
          </div>
          
          {channels && channels.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {channels.slice(0, 6).map(channel => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onPlay={handlePlayChannel}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
