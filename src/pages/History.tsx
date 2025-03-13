
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Channel } from '@/types';
import { getWatchHistoryWithChannels, clearWatchHistory, removeFromWatchHistory } from '@/services/historyService';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from 'lucide-react';
import { toggleFavoriteChannel } from '@/services/channelService';
import VideoPlayer from '@/components/VideoPlayer';

// Import the refactored components
import HistoryHeader from '@/components/history/HistoryHeader';
import SearchBar from '@/components/history/SearchBar';
import EmptyHistory from '@/components/history/EmptyHistory';
import ClearHistoryDialog from '@/components/history/ClearHistoryDialog';
import HistoryChannelList from '@/components/history/HistoryChannelList';

const History: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // استعلام لجلب سجل المشاهدة
  const { data: historyChannels = [], isLoading, refetch } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: getWatchHistoryWithChannels
  });
  
  // مرشح القنوات بناءً على البحث
  const filteredChannels = searchQuery
    ? historyChannels.filter(channel => 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : historyChannels;
    
  // تشغيل قناة
  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };
  
  // إغلاق مشغل الفيديو
  const handleClosePlayer = () => {
    setSelectedChannel(null);
  };
  
  // حذف قناة من السجل
  const handleRemoveFromHistory = async (channelId: string) => {
    try {
      await removeFromWatchHistory(channelId);
      refetch();
      toast({
        title: "تم الحذف",
        description: "تم إزالة القناة من سجل المشاهدة",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشلت عملية الحذف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  // مسح جميع السجلات
  const handleClearHistory = async () => {
    try {
      await clearWatchHistory();
      refetch();
      setConfirmDialogOpen(false);
      toast({
        title: "تم المسح",
        description: "تم مسح سجل المشاهدة بالكامل",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشلت عملية المسح. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  // تبديل الإعجاب بالقناة
  const handleToggleFavorite = async (channelId: string) => {
    try {
      await toggleFavoriteChannel(channelId);
      refetch();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشلت عملية تحديث المفضلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container max-w-7xl mx-auto p-4 pb-24">
      <HistoryHeader />
      
      {/* شريط البحث والإجراءات */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Button 
          variant="destructive" 
          onClick={() => setConfirmDialogOpen(true)}
          disabled={historyChannels.length === 0}
        >
          <Trash2 className="mr-2" size={16} />
          مسح السجل
        </Button>
      </div>
      
      {/* عرض القنوات */}
      {filteredChannels.length > 0 ? (
        <HistoryChannelList 
          isLoading={isLoading}
          channels={filteredChannels}
          onPlayChannel={handlePlayChannel}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <EmptyHistory searchQuery={searchQuery} />
      )}
      
      {/* مشغل الفيديو */}
      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={handleClosePlayer} 
        />
      )}
      
      {/* مربع حوار تأكيد مسح السجل */}
      <ClearHistoryDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default History;
