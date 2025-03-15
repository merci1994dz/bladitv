
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getCategories } from '@/services/api';
import NewChannelForm from './channels/NewChannelForm';
import ChannelsList from './channels/ChannelsList';
import { useChannelsAdmin } from '@/hooks/useChannelsAdmin';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ChannelsTab: React.FC = () => {
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
      {/* Form for adding new channels - with sync button */}
      <NewChannelForm 
        categories={categories || []} 
        countries={countries || []} 
        onAddChannel={addChannel}
        onManualSync={manualSyncChannels}
      />
      
      {/* List of existing channels */}
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
