
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Link, Server } from 'lucide-react';
import NewChannelForm from './NewChannelForm';
import RemoteSourceForm from './RemoteSourceForm';

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
  const [activeTab, setActiveTab] = useState<string>("add");

  return (
    <Card className="border border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Server className="h-5 w-5 text-primary" />
          <span>إدارة القنوات</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full grid grid-cols-2">
            <TabsTrigger value="add" className="flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>إضافة قناة جديدة</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-1.5">
              <Link className="h-4 w-4" />
              <span>استيراد من bladi-info.com</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="mt-0">
            <NewChannelForm 
              categories={categories || []} 
              countries={countries || []} 
              onAddChannel={addChannel}
              onManualSync={manualSyncChannels}
            />
          </TabsContent>
          
          <TabsContent value="import" className="mt-0">
            <RemoteSourceForm 
              onSyncComplete={() => {
                manualSyncChannels();
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChannelsManager;
