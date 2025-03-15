
import React from 'react';
import { AdminChannel } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import ChannelDisplayCard from './ChannelDisplayCard';
import ChannelEditForm from './ChannelEditForm';

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
  return (
    <Card key={channel.id}>
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
