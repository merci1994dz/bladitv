
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
  // Create a list of unique categories by ID
  const uniqueCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // Use a Map to ensure uniqueness by ID
    const uniqueMap = new Map<string, Category>();
    
    categories.forEach(category => {
      if (!uniqueMap.has(category.id)) {
        uniqueMap.set(category.id, category);
      }
    });
    
    // Convert Map values to an array and sort by name
    return Array.from(uniqueMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  return (
    <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
      <div className="bg-gradient-to-r from-primary/5 to-background px-2 py-2 rounded-xl mb-6">
        <TabsList className="flex flex-wrap h-auto py-2 px-2 gap-2 bg-background/50 backdrop-blur-sm rounded-lg">
          <TabsTrigger 
            value="all" 
            className="rounded-md text-sm py-2 shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            جميع القنوات
          </TabsTrigger>
          
          {uniqueCategories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="rounded-md text-sm py-2 shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      <TabsContent value={selectedCategory} className="mt-0 animate-fade-in">
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
