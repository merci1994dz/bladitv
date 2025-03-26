
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCountries, getCategories } from '@/services/api';
import { useChannelsAdmin } from '@/hooks/useChannelsAdmin';
import { useToast } from '@/hooks/use-toast';
import { forceDataRefresh, getLastSyncTime } from '@/services/sync';
import { ensureLatestData } from '@/utils/forceUpdate';
import SyncSettings from './channels/SyncSettings';
import ChannelsManager from './channels/ChannelsManager';
import ChannelsList from './channels/ChannelsList';

const ChannelsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  // مستمع لأحداث تحديث البيانات
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log("تم اكتشاف تحديث للبيانات، جاري إعادة تحميل البيانات...");
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setLastSyncTime(getLastSyncTime());
    };

    window.addEventListener('app_data_updated', handleDataUpdate);
    window.addEventListener('force_data_refresh', handleDataUpdate);
    
    return () => {
      window.removeEventListener('app_data_updated', handleDataUpdate);
      window.removeEventListener('force_data_refresh', handleDataUpdate);
    };
  }, [queryClient]);
  
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
      title: "جاري النشر",
      description: "جاري تحديث البيانات ونشرها للمستخدمين..."
    });
    
    try {
      await forceDataRefresh();
      
      // ضمان تحديث واجهة المستخدم بأحدث البيانات
      await ensureLatestData();
      
      setLastSyncTime(getLastSyncTime());
      
      // إعادة تحميل البيانات من الخادم
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      toast({
        title: "تم النشر",
        description: "تم تحديث البيانات بنجاح ونشرها للمستخدمين",
      });
    } catch (error) {
      console.error("خطأ في عملية النشر:", error);
      toast({
        title: "حدث خطأ",
        description: "فشلت عملية النشر، يرجى المحاولة مرة أخرى",
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
      <SyncSettings 
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        autoPublish={autoPublish}
        setAutoPublish={setAutoPublish}
        handleForceSync={handleForceSync}
      />
    
      {/* بطاقة إدارة القنوات */}
      <ChannelsManager 
        categories={categories || []}
        countries={countries || []}
        addChannel={addChannel}
        manualSyncChannels={manualSyncChannels}
      />
      
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
