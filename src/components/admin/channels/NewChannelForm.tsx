
import React, { useState } from 'react';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, LinkIcon, ImageIcon, Tag, Flag } from 'lucide-react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

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
    
    toast({
      title: "تمت الإضافة بنجاح",
      description: `تمت إضافة قناة "${newChannel.name}" ونشرها للمستخدمين`,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary/80" />
                <span>اسم القناة</span>
              </Label>
              <Input
                id="name"
                value={newChannel.name}
                onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                placeholder="اسم القناة"
                dir="rtl"
                className="transition-all focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo" className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary/80" />
                <span>شعار القناة (رابط)</span>
              </Label>
              <Input
                id="logo"
                value={newChannel.logo}
                onChange={(e) => setNewChannel({...newChannel, logo: e.target.value})}
                placeholder="https://example.com/logo.png"
                dir="ltr"
                className="transition-all focus:border-primary"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="streamUrl" className="flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-primary/80" />
                <span>رابط البث</span>
              </Label>
              <Input
                id="streamUrl"
                value={newChannel.streamUrl}
                onChange={(e) => setNewChannel({...newChannel, streamUrl: e.target.value})}
                placeholder="https://example.com/stream.m3u8"
                dir="ltr"
                className="transition-all focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary/80" />
                <span>الفئة</span>
              </Label>
              <Select
                value={newChannel.category}
                onValueChange={(value) => setNewChannel({...newChannel, category: value})}
              >
                <SelectTrigger id="category" className="transition-all">
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
              <Label htmlFor="country" className="flex items-center gap-1.5">
                <Flag className="h-4 w-4 text-primary/80" />
                <span>البلد</span>
              </Label>
              <Select
                value={newChannel.country}
                onValueChange={(value) => setNewChannel({...newChannel, country: value})}
              >
                <SelectTrigger id="country" className="transition-all">
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

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full sm:w-auto gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>إضافة القناة</span>
            </Button>
          </div>
        </form>
      </CardContent>
      
      {onManualSync && (
        <>
          <Separator className="my-2" />
          <CardFooter className="pt-4 pb-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'جاري المزامنة...' : 'مزامنة القنوات ونشرها للمستخدمين'}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default NewChannelForm;
