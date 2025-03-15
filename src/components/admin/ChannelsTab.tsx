
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getCategories } from '@/services/api';
import NewChannelForm from './channels/NewChannelForm';
import ChannelsList from './channels/ChannelsList';
import { useChannelsAdmin } from '@/hooks/useChannelsAdmin'; // This import stays the same
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, RefreshCw, Server, Link, Settings } from 'lucide-react';
import RemoteSourceForm from './channels/RemoteSourceForm';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { syncAllData, forceDataRefresh, getLastSyncTime } from '@/services/sync';

const ChannelsTab: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("add");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  
  // تحديث وقت آخر مزامنة
  useEffect(() => {
    setLastSyncTime(getLastSyncTime());
    
    // تحقق من حالة النشر التلقائي المخزنة
    const savedAutoPublish = localStorage.getItem('channels_auto_publish');
    if (savedAutoPublish !== null) {
      setAutoPublish(savedAutoPublish === 'true');
    }
  }, []);
  
  // حفظ حالة النشر التلقائي
  useEffect(() => {
    localStorage.setItem('channels_auto_publish', autoPublish.toString());
  }, [autoPublish]);
  
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
  } = useChannelsAdmin({ autoPublish });

  // وظيفة مزامنة البيانات مع ظهور مؤشر التحميل
  const handleForceSync = async () => {
    setIsSyncing(true);
    toast({
      title: "جاري المزامنة",
      description: "جاري تحديث البيانات ونشرها للمستخدمين..."
    });
    
    try {
      await forceDataRefresh();
      setLastSyncTime(getLastSyncTime());
      
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث البيانات بنجاح ونشرها للمستخدمين",
      });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشلت عملية المزامنة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoadingChannels || isLoadingCountries || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* بطاقة إعدادات المزامنة */}
      <Card className="border border-primary/20 shadow-md">
        <CardHeader className="bg-muted/30 pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            <span>إعدادات المزامنة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-publish"
                    checked={autoPublish}
                    onCheckedChange={setAutoPublish}
                  />
                  <Label htmlFor="auto-publish" className="font-medium">النشر التلقائي للقنوات</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  عند التفعيل، سيتم نشر القنوات تلقائياً للمستخدمين بعد الإضافة أو التعديل
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>مزامنة البيانات</span>
              </Button>
            </div>
            
            {lastSyncTime && (
              <p className="text-sm text-muted-foreground">
                آخر تحديث: {new Date(lastSyncTime).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    
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
