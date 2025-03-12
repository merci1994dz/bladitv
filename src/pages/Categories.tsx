
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getChannelsByCategory, toggleFavoriteChannel } from '@/services/api';
import { Tab, Tabs, TabList, TabPanel } from '@/components/ui/tabs';
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
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
          <TabsList className="w-full overflow-x-auto flex justify-start mb-4 px-4 bg-transparent">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                onClick={() => handleTabChange(category.id)}
                className="px-6 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="px-4">
              {isLoadingChannels ? (
                <div className="py-10 flex justify-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
                    <div className="col-span-full py-10 text-center text-gray-500">
                      لا توجد قنوات في هذه الفئة
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
