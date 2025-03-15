
import React from 'react';
import { AdminChannel } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import ChannelDisplayCard from './ChannelDisplayCard';
import ChannelEditForm from './ChannelEditForm';
import { Badge } from '@/components/ui/badge';

interface ChannelItemProps {
  channel: AdminChannel;
  countries: any[];
  categories: any[];
  onEdit: (channelId: string) => void;
  onSave: (channel: AdminChannel) => void;
  onDelete: (channelId: string) => void;
  onUpdateField: (id: string, field: keyof AdminChannel, value: string) => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  countries,
  categories,
  onEdit,
  onSave,
  onDelete,
  onUpdateField
}) => {
  // Find country and category data for badges
  const country = countries.find(c => c.id === channel.country);
  const category = categories.find(c => c.id === channel.category);
  
  return (
    <Card key={channel.id} className="relative">
      {/* Status badges - visible on both edit and display modes */}
      <div className="absolute top-2 right-2 flex flex-wrap gap-1 z-10">
        {channel.isFavorite && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            مفضلة
          </Badge>
        )}
        {country && (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-800">
            {country.flag} {country.name}
          </Badge>
        )}
        {category && (
          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-800">
            {category.name}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        {channel.isEditing ? (
          <ChannelEditForm 
            channel={channel}
            categories={categories}
            countries={countries}
            onCancel={onEdit}
            onSave={onSave}
            onUpdateField={onUpdateField}
          />
        ) : (
          <ChannelDisplayCard 
            channel={channel}
            countries={countries}
            categories={categories}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelItem;
