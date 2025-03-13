
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Channel } from '@/types';
import { getWatchHistoryWithChannels, clearWatchHistory, removeFromWatchHistory } from '@/services/historyService';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Clock, ClockX, Search, X, Trash2, Play } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { toggleFavoriteChannel } from '@/services/channelService';

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
      <header className="pt-10 pb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Clock className="inline-block mr-2" />
          سجل المشاهدة
        </h1>
        <p className="text-muted-foreground">
          اعرض القنوات التي شاهدتها مؤخراً
        </p>
      </header>
      
      {/* شريط البحث والإجراءات */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث في سجل المشاهدة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
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
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-3 w-20 h-20"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredChannels.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onPlay={handlePlayChannel}
              onToggleFavorite={handleToggleFavorite}
              lastWatched={(channel as any).lastWatched}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClockX size={64} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">لا توجد قنوات في سجل المشاهدة</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery ? 
              'لا توجد نتائج تطابق بحثك. جرب كلمات بحث أخرى.' : 
              'عند مشاهدة القنوات، ستظهر هنا لسهولة الوصول إليها في وقت لاحق.'}
          </p>
          <Button onClick={() => window.location.href = '/home'}>
            <Play size={16} className="mr-2" />
            تصفح القنوات
          </Button>
        </div>
      )}
      
      {/* مشغل الفيديو */}
      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={handleClosePlayer} 
        />
      )}
      
      {/* مربع حوار تأكيد مسح السجل */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مسح سجل المشاهدة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد مسح سجل المشاهدة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleClearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              مسح السجل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
