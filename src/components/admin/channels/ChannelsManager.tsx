
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Link, Server, Globe } from 'lucide-react';
import NewChannelForm from './NewChannelForm';
import RemoteSourceForm from './RemoteSourceForm';
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
  const [activeTab, setActiveTab] = useState<string>("import");
  const { toast } = useToast();
  
  // تأكد من تهيئة التطبيق للاستضافة عند التحميل
  useEffect(() => {
    // التحقق من وجود ربط صحيح للاستضافة
    const checkHostingConfig = async () => {
      try {
        // اختبار الاتصال بالمصدر الخارجي
        const testUrl = 'https://bladi-info.com/api/channels.json';
        const response = await fetch(`${testUrl}?_=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store'
        });
        
        if (response.ok) {
          console.log('تم التحقق من الاتصال بـ bladi-info.com بنجاح');
        }
      } catch (error) {
        console.warn('تنبيه: قد يكون هناك مشكلة في الاتصال بالمصدر الخارجي', error);
        
        toast({
          title: "تنبيه حول الاستضافة",
          description: "قد تحتاج لضبط CORS لإتاحة الاتصال بـ bladi-info.com من الاستضافة الخاصة بك",
          duration: 10000
        });
      }
    };
    
    checkHostingConfig();
  }, [toast]);

  return (
    <Card className="border border-primary/20 shadow-md">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Server className="h-5 w-5 text-primary" />
          <span>إدارة القنوات</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="import" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full grid grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span>استيراد من bladi-info.com</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>إضافة قناة جديدة</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="mt-0">
            <RemoteSourceForm 
              onSyncComplete={() => {
                manualSyncChannels();
              }}
            />
          </TabsContent>
          
          <TabsContent value="add" className="mt-0">
            <NewChannelForm 
              categories={categories || []} 
              countries={countries || []} 
              onAddChannel={addChannel}
              onManualSync={manualSyncChannels}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChannelsManager;
