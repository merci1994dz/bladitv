
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getChannelsByCategory, toggleFavoriteChannel } from '@/services/api';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Menu, RefreshCw, Bell, Search } from 'lucide-react';

const Categories: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const { 
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { 
    data: categoryChannels,
    isLoading: isLoadingChannels,
  } = useQuery({
    queryKey: ['channelsByCategory', activeCategory],
    queryFn: () => activeCategory ? getChannelsByCategory(activeCategory) : Promise.resolve([]),
    enabled: !!activeCategory,
  });

  const handleTabChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

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

  if (isLoadingCategories) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white/70 animate-pulse">جاري تحميل الفئات...</p>
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

      {/* علامات التبويب */}
      <div className="tv-tabs">
        <div className="tv-tab active">القنوات</div>
        <div className="tv-tab">الأفلام</div>
        <div className="tv-tab">المسلسلات</div>
        <div className="tv-tab">المباريات</div>
      </div>

      {/* عرض القنوات */}
      {isLoadingChannels ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-white/70 text-sm">جاري تحميل القنوات...</p>
        </div>
      ) : (
        <div className="tv-channel-grid">
          {categoryChannels && categoryChannels.length > 0 ? (
            categoryChannels.map(channel => (
              <div key={channel.id} className="tv-channel-card">
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  className="tv-channel-logo"
                  onClick={() => handlePlayChannel(channel)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'public/lovable-uploads/7767e4e3-bb19-4d88-905f-ca592b2eca1e.png';
                  }}
                />
                <div className="tv-channel-name">{channel.name}</div>
                {channel.isFavorite && (
                  <div className="absolute top-2 right-2">
                    <span className="text-yellow-500">★</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 py-10 text-center">
              <div className="bg-white/5 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-white/70 mb-2">لا توجد قنوات في هذه الفئة</p>
                <p className="text-sm text-white/50">يمكنك استكشاف فئات أخرى أو العودة لاحقًا</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
