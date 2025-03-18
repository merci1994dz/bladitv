
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
  return (
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
          onPlayChannel={onPlayChannel}
          onToggleFavorite={onToggleFavorite}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CategoryTabs;
