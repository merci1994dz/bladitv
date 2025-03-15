
import React from 'react';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isSyncing, setIsSyncing] = React.useState(false);
  
  const [newChannel, setNewChannel] = React.useState<Omit<Channel, 'id'>>({
    name: '',
    logo: '',
    streamUrl: '',
    category: '',
    country: '',
    isFavorite: false
  });
  
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name || !newChannel.logo || !newChannel.streamUrl || !newChannel.category || !newChannel.country) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    onAddChannel(newChannel);
    
    // تفريغ النموذج بعد الإضافة
    setNewChannel({
      name: '',
      logo: '',
      streamUrl: '',
      category: '',
      country: '',
      isFavorite: false
    });
  };
  
  const handleManualSync = async () => {
    if (!onManualSync) return;
    
    setIsSyncing(true);
    try {
      await onManualSync();
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="h-5 w-5 ml-2" />
          <span>إضافة قناة جديدة</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleAddChannel}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">اسم القناة</label>
              <Input
                id="name"
                value={newChannel.name}
                onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                placeholder="اسم القناة"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="logo" className="text-sm font-medium">شعار القناة (رابط)</label>
              <Input
                id="logo"
                value={newChannel.logo}
                onChange={(e) => setNewChannel({...newChannel, logo: e.target.value})}
                placeholder="https://example.com/logo.png"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="streamUrl" className="text-sm font-medium">رابط البث</label>
              <Input
                id="streamUrl"
                value={newChannel.streamUrl}
                onChange={(e) => setNewChannel({...newChannel, streamUrl: e.target.value})}
                placeholder="https://example.com/stream.m3u8"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">الفئة</label>
              <Select
                value={newChannel.category}
                onValueChange={(value) => setNewChannel({...newChannel, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">البلد</label>
              <Select
                value={newChannel.country}
                onValueChange={(value) => setNewChannel({...newChannel, country: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر البلد" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {countries?.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">إضافة القناة</Button>
        </form>
      </CardContent>
      {onManualSync && (
        <CardFooter className="flex justify-center pt-0">
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="mt-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'جاري المزامنة...' : 'مزامنة القنوات ونشرها للمستخدمين'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NewChannelForm;
