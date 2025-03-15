
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Server } from 'lucide-react';
import NewChannelForm from './NewChannelForm';
import { useToast } from '@/hooks/use-toast';

interface ChannelsManagerProps {
  categories: any[];
  countries: any[];
  addChannel: (channel: any) => void;
  manualSyncChannels: () => Promise<void>;
}

const ChannelsManager: React.FC<ChannelsManagerProps> = ({
  categories,
  countries,
  addChannel,
  manualSyncChannels
}) => {
  const { toast } = useToast();
  
  return (
    <Card className="border border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Server className="h-5 w-5 text-primary" />
          <span>إدارة القنوات</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <NewChannelForm 
          categories={categories || []} 
          countries={countries || []} 
          onAddChannel={addChannel}
          onManualSync={manualSyncChannels}
        />
      </CardContent>
    </Card>
  );
};

export default ChannelsManager;
