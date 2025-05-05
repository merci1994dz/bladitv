
import React, { useState } from 'react';
import { Channel, Category, Country } from '@/types';
import CategoryTabs from './CategoryTabs';
import RecentlyWatchedChannels from '@/components/recently-watched/RecentlyWatchedChannels';
import LoadingIndicator from '@/components/LoadingIndicator';
import { useToast } from '@/hooks/use-toast';

interface HomeContentProps {
  channels?: Channel[];
  categories?: Category[];
  countries?: Country[];
  recentlyWatched?: Channel[];
  isLoading: boolean;
  error: any;
  onPlayChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  refetchChannels: () => Promise<any>;
}

const HomeContent: React.FC<HomeContentProps> = ({
  channels,
  categories,
  countries,
  recentlyWatched,
  isLoading,
  error,
  onPlayChannel,
  onToggleFavorite,
  refetchChannels
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // تحسين: تحسين شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <LoadingIndicator size="large" text="جاري تحميل القنوات..." />
      </div>
    );
  }

  // تحسين: عرض رسالة خطأ إذا كان هناك مشكلة في تحميل القنوات
  if (error && !channels?.length) {
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

  const filteredChannels = channels?.filter(channel => {
    if (selectedCategory === 'all') return true;
    return channel.category === selectedCategory;
  }) || [];

  return (
    <>
      {/* Display recently watched channels if available */}
      {recentlyWatched && recentlyWatched.length > 0 && (
        <RecentlyWatchedChannels 
          channels={recentlyWatched}
          isLoading={false}
          onChannelClick={onPlayChannel}
        />
      )}
      
      {/* علامات التبويب والقنوات */}
      <CategoryTabs 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        filteredChannels={filteredChannels}
        countries={countries}
        onPlayChannel={onPlayChannel}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
};

export default HomeContent;
