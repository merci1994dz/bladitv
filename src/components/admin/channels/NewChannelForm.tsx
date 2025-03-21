
import React, { useState } from 'react';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ChannelFormFields from './ChannelFormFields';
import ChannelFormActions from './ChannelFormActions';
import { saveChannelsToStorage } from '@/services/dataStore';
import { publishChannelsToAllUsers } from '@/services/sync';

interface NewChannelFormProps {
  categories: any[];
  countries: any[];
  onAddChannel: (channel: Omit<Channel, 'id'>) => void;
  onManualSync?: () => Promise<void>;
}

const NewChannelForm: React.FC<NewChannelFormProps> = ({ 
  categories, 
  countries, 
  onAddChannel,
  onManualSync 
}) => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [newChannel, setNewChannel] = useState<Omit<Channel, 'id'>>({
    name: '',
    logo: '',
    streamUrl: '',
    category: '',
    country: '',
    isFavorite: false
  });
  
  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name || !newChannel.logo || !newChannel.streamUrl || !newChannel.category || !newChannel.country) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // إضافة القناة
      onAddChannel(newChannel);
      
      // ضمان حفظ القناة وتوفرها للجميع
      await saveChannelsToStorage();
      
      // محاولة نشرها لجميع المستخدمين
      try {
        await publishChannelsToAllUsers();
        console.log("تم نشر القناة الجديدة للمستخدمين");
      } catch (err) {
        console.error("خطأ أثناء نشر القناة للمستخدمين:", err);
      }
      
      // تفريغ النموذج بعد الإضافة
      setNewChannel({
        name: '',
        logo: '',
        streamUrl: '',
        category: '',
        country: '',
        isFavorite: false
      });
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة قناة "${newChannel.name}" ونشرها للمستخدمين`,
      });
    } catch (error) {
      console.error("خطأ أثناء إضافة القناة:", error);
      toast({
        title: "خطأ في إضافة القناة",
        description: "حدث خطأ أثناء إضافة القناة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
  const handleFieldChange = (field: keyof Omit<Channel, 'id'>, value: string) => {
    setNewChannel({...newChannel, [field]: value});
  };
  
  const handleManualSync = async () => {
    if (!onManualSync) return;
    
    setIsSyncing(true);
    try {
      await onManualSync();
      
      // عرض رسالة نجاح المزامنة
      toast({
        title: "تم النشر بنجاح",
        description: "تم نشر جميع القنوات للمستخدمين",
      });
    } catch (error) {
      console.error("خطأ أثناء النشر:", error);
      toast({
        title: "خطأ في النشر",
        description: "حدث خطأ أثناء نشر القنوات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Card className="border border-primary/10 shadow-sm mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PlusCircle className="h-5 w-5 text-primary" />
          <span>إضافة قناة جديدة</span>
        </CardTitle>
        <CardDescription>
          أضف قناة جديدة يدويًا وسيتم نشرها مباشرة لجميع المستخدمين
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form className="space-y-5" onSubmit={handleAddChannel} id="new-channel-form">
          <ChannelFormFields 
            channel={newChannel}
            onChange={handleFieldChange}
            categories={categories}
            countries={countries}
          />

          <ChannelFormActions 
            onManualSync={onManualSync ? handleManualSync : undefined}
            isSyncing={isSyncing}
          />
        </form>
      </CardContent>
      
      {onManualSync && (
        <>
          <Separator className="my-2" />
          <CardFooter className="pt-4 pb-4">
            <ChannelFormActions 
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
              submitLabel="نشر القنوات للمستخدمين"
              submitIcon={<PlusCircle className="h-4 w-4" />}
              isSubmitDisabled={true}
            />
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default NewChannelForm;
