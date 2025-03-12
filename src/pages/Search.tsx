
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchChannels, toggleFavoriteChannel } from '@/services/api';
import { Input } from '@/components/ui/input';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { Search as SearchIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const { toast } = useToast();

  const { 
    data: searchResults,
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['searchChannels', searchQuery],
    queryFn: () => searchChannels(searchQuery),
    enabled: searchPerformed && searchQuery.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      setSearchPerformed(true);
      refetch();
    }
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

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <h1 className="text-2xl font-bold text-center">البحث</h1>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      <div className="px-4 mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن قناة..."
            className="pl-10 pr-4 py-3 text-right rounded-full"
            dir="rtl"
          />
          <button 
            type="submit" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            <SearchIcon size={20} />
          </button>
        </form>
      </div>

      <div className="px-4">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : searchPerformed ? (
          <>
            {searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map(channel => (
                  <ChannelCard 
                    key={channel.id} 
                    channel={channel} 
                    onPlay={handlePlayChannel}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500">
                لا توجد نتائج مطابقة لبحثك
              </div>
            )}
          </>
        ) : (
          <div className="py-10 text-center text-gray-500">
            ابحث عن قناتك المفضلة
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
