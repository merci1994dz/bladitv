
import React, { useState } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { 
  getChannels, 
  getCountries, 
  getCategories,
  addChannel,
  updateChannel,
  deleteChannel
} from '@/services/api';
import { Channel, AdminChannel } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, 
  Pencil, 
  Trash, 
  Save, 
  X
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ChannelsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For new channel
  const [newChannel, setNewChannel] = useState<Omit<Channel, 'id'>>({
    name: '',
    logo: '',
    streamUrl: '',
    category: '',
    country: '',
    isFavorite: false
  });
  
  // For editing
  const [editableChannels, setEditableChannels] = useState<AdminChannel[]>([]);
  
  // Queries
  const { 
    data: channels,
    isLoading: isLoadingChannels
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels
  });
  
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

  // Use useEffect instead of onSuccess callback for handling the data
  React.useEffect(() => {
    if (channels) {
      setEditableChannels(channels.map(channel => ({ ...channel, isEditing: false })));
    }
  }, [channels]);
  
  // Mutations
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
  
  const updateChannelMutation = useMutation({
    mutationFn: updateChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات القناة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر تحديث القناة: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteChannelMutation = useMutation({
    mutationFn: deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف القناة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر حذف القناة: ${error.message}`,
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
  
  const toggleEditChannel = (id: string) => {
    setEditableChannels(channels => channels.map(channel => 
      channel.id === id 
        ? { ...channel, isEditing: !channel.isEditing } 
        : channel
    ));
  };
  
  const updateEditableChannel = (id: string, field: keyof AdminChannel, value: string) => {
    setEditableChannels(channels => channels.map(channel => 
      channel.id === id 
        ? { ...channel, [field]: value } 
        : channel
    ));
  };
  
  const saveChannelChanges = (channel: AdminChannel) => {
    const { isEditing, ...channelData } = channel;
    updateChannelMutation.mutate(channelData as Channel);
    toggleEditChannel(channel.id);
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
      
      <h2 className="text-xl font-bold mt-8 mb-4">قائمة القنوات ({editableChannels.length})</h2>
      
      <div className="space-y-4">
        {editableChannels.map(channel => (
          <Card key={channel.id}>
            <CardContent className="p-4">
              {channel.isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم القناة</label>
                      <Input
                        value={channel.name}
                        onChange={(e) => updateEditableChannel(channel.id, 'name', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">شعار القناة (رابط)</label>
                      <Input
                        value={channel.logo}
                        onChange={(e) => updateEditableChannel(channel.id, 'logo', e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رابط البث</label>
                      <Input
                        value={channel.streamUrl}
                        onChange={(e) => updateEditableChannel(channel.id, 'streamUrl', e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الفئة</label>
                      <Select
                        value={channel.category}
                        onValueChange={(value) => updateEditableChannel(channel.id, 'category', value)}
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
                      <label className="text-sm font-medium">البلد</label>
                      <Select
                        value={channel.country}
                        onValueChange={(value) => updateEditableChannel(channel.id, 'country', value)}
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
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleEditChannel(channel.id)}
                    >
                      <X className="h-4 w-4 ml-1" />
                      <span>إلغاء</span>
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => saveChannelChanges(channel)}
                    >
                      <Save className="h-4 w-4 ml-1" />
                      <span>حفظ</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="flex-shrink-0 ml-4">
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      className="w-16 h-16 object-contain bg-gray-100 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{channel.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {countries?.find(c => c.id === channel.country)?.name} {countries?.find(c => c.id === channel.country)?.flag} | 
                      {categories?.find(c => c.id === channel.category)?.name}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleEditChannel(channel.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من حذف هذه القناة؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم حذف "{channel.name}" نهائيًا ولا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteChannelMutation.mutate(channel.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChannelsTab;
