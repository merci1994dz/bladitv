
import React from 'react';
import { Channel } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addChannel } from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
}

const NewChannelForm: React.FC<NewChannelFormProps> = ({ categories, countries }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newChannel, setNewChannel] = React.useState<Omit<Channel, 'id'>>({
    name: '',
    logo: '',
    streamUrl: '',
    category: '',
    country: '',
    isFavorite: false
  });
  
  const addChannelMutation = useMutation({
    mutationFn: addChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة القناة الجديدة",
      });
      setNewChannel({
        name: '',
        logo: '',
        streamUrl: '',
        category: '',
        country: '',
        isFavorite: false
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر إضافة القناة: ${error.message}`,
        variant: "destructive",
      });
    }
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
    addChannelMutation.mutate(newChannel);
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
    </Card>
  );
};

export default NewChannelForm;
