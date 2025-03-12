
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getChannelsByCategory, toggleFavoriteChannel } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 animate-pulse">جاري تحميل الفئات...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <h1 className="text-2xl font-bold text-center">الفئات</h1>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {categories && categories.length > 0 && (
        <Tabs defaultValue={categories[0].id} dir="rtl" className="w-full">
          <div className="relative">
            <TabsList className="w-full overflow-x-auto flex justify-start mb-4 px-4 bg-transparent">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  onClick={() => handleTabChange(category.id)}
                  className="px-6 py-2 transition-all duration-200 hover:bg-primary/10"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="px-4 animate-fade-in">
              {isLoadingChannels ? (
                <div className="py-10 flex flex-col justify-center items-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-gray-500">جاري تحميل القنوات...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryChannels && categoryChannels.length > 0 ? (
                    categoryChannels.map(channel => (
                      <ChannelCard 
                        key={channel.id} 
                        channel={channel} 
                        onPlay={handlePlayChannel}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-gray-500 mb-2">لا توجد قنوات في هذه الفئة</p>
                        <p className="text-sm text-gray-400">يمكنك استكشاف فئات أخرى أو العودة لاحقًا</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Categories;
