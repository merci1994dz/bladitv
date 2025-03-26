
import React from 'react';
import { Category } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChannelsList from '@/components/channel/ChannelsList';
import { Channel, Country } from '@/types';

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: Category[] | undefined;
  filteredChannels: Channel[];
  countries: Country[] | undefined;
  onPlayChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredChannels,
  countries,
  onPlayChannel,
  onToggleFavorite
}) => {
  // إنشاء قائمة فريدة من الفئات بواسطة المعرف
  const uniqueCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // استخدام خريطة لضمان الفرادة حسب المعرف
    const uniqueMap = new Map<string, Category>();
    
    categories.forEach(category => {
      if (!uniqueMap.has(category.id)) {
        uniqueMap.set(category.id, category);
      }
    });
    
    // تحويل قيم الخريطة إلى مصفوفة وترتيبها حسب الاسم
    return Array.from(uniqueMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  return (
    <div className="w-full bg-black">
      <div className="tv-tabs">
        <div 
          className={`tv-tab ${selectedCategory === 'all' ? 'active' : ''}`} 
          onClick={() => setSelectedCategory('all')}
        >
          القنوات
        </div>
        <div 
          className={`tv-tab ${selectedCategory === 'movies' ? 'active' : ''}`} 
          onClick={() => setSelectedCategory('movies')}
        >
          الأفلام
        </div>
        <div 
          className={`tv-tab ${selectedCategory === 'series' ? 'active' : ''}`} 
          onClick={() => setSelectedCategory('series')}
        >
          المسلسلات
        </div>
        <div 
          className={`tv-tab ${selectedCategory === 'sports' ? 'active' : ''}`} 
          onClick={() => setSelectedCategory('sports')}
        >
          المباريات
        </div>
      </div>
      
      <div className="animate-fade-in">
        <ChannelsList 
          channels={filteredChannels}
          countries={countries || []}
          activeCountry={null}
          isLoading={false}
          onPlayChannel={onPlayChannel}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </div>
  );
};

export default CategoryTabs;
