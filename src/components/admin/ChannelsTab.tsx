
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getCategories } from '@/services/api';
import NewChannelForm from './channels/NewChannelForm';
import ChannelsList from './channels/ChannelsList';
import { useChannelsAdmin } from '@/hooks/useChannelsAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, RefreshCw, Server, Link } from 'lucide-react';
import RemoteSourceForm from './channels/RemoteSourceForm';

const ChannelsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("add");
  
  // Get categories and countries data
  const { 
    data: countries,
    isLoading: isLoadingCountries
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries
  });
  
  const { 
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  // Use the enhanced channels admin hook
  const {
    editableChannels,
    isLoadingChannels,
    addChannel,
    toggleEditChannel,
    updateEditableChannel,
    saveChannelChanges,
    handleDeleteChannel,
    manualSyncChannels
  } = useChannelsAdmin();

  if (isLoadingChannels || isLoadingCountries || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
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
              {/* نموذج إضافة قناة جديدة */}
              <NewChannelForm 
                categories={categories || []} 
                countries={countries || []} 
                onAddChannel={addChannel}
                onManualSync={manualSyncChannels}
              />
            </TabsContent>
            
            <TabsContent value="import" className="mt-0">
              {/* استيراد من bladi-info.com */}
              <RemoteSourceForm 
                onSyncComplete={() => {
                  manualSyncChannels();
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* قائمة القنوات الحالية */}
      <ChannelsList 
        channels={editableChannels}
        countries={countries || []}
        categories={categories || []}
        onEdit={toggleEditChannel}
        onSave={saveChannelChanges}
        onDelete={handleDeleteChannel}
        onUpdateField={updateEditableChannel}
      />
    </div>
  );
};

export default ChannelsTab;
