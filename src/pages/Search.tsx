
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchChannels, toggleFavoriteChannel } from '@/services/api';
import { Input } from '@/components/ui/input';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { Search as SearchIcon, X, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

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
    } else if (searchQuery.length > 0) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال حرفين على الأقل للبحث",
        variant: "default",
        duration: 3000,
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchPerformed(false);
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

  // Effect to auto search when query is 2+ characters
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        setSearchPerformed(true);
        refetch();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, refetch]);

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-primary/80 to-primary rounded-full p-2 mr-2">
              <SearchIcon className="text-white h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-center">البحث</h1>
          </div>
        </div>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      <div className="px-4 mb-6">
        <div className="container mx-auto max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قناة..."
              className="pl-10 pr-10 py-3 text-right rounded-full shadow-sm focus:shadow-md transition-shadow bg-white dark:bg-gray-800"
              dir="rtl"
            />
            <button 
              type="submit" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
              aria-label="بحث"
            >
              <SearchIcon size={20} />
            </button>
            {searchQuery && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                aria-label="مسح"
              >
                <X size={16} />
              </button>
            )}
          </form>
          
          {searchQuery && searchQuery.length < 2 && (
            <div className="mt-2 text-xs text-muted-foreground text-center">
              يرجى إدخال حرفين على الأقل للبحث
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : searchPerformed ? (
            <>
              {searchResults && searchResults.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-muted-foreground text-center">
                    تم العثور على {searchResults.length} نتيجة للبحث عن "{searchQuery}"
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchResults.map(channel => (
                      <ChannelCard 
                        key={channel.id} 
                        channel={channel} 
                        onPlay={handlePlayChannel}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Info className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                    لا توجد نتائج مطابقة
                  </p>
                  <p className="text-gray-500 mb-4">
                    لم نتمكن من العثور على أي قنوات تطابق بحثك "{searchQuery}"
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleClearSearch}
                    className="bg-transparent border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    مسح البحث
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                <SearchIcon className="h-10 w-10 text-primary" />
              </div>
              <p className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">
                ابحث عن قناتك المفضلة
              </p>
              <p className="text-gray-500 max-w-md mx-auto">
                يمكنك البحث عن القنوات حسب الاسم. أدخل اسم القناة في مربع البحث أعلاه.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
