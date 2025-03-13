import React, { useState, useEffect } from 'react';
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
  deleteChannel,
  addCountry,
  updateCountry,
  deleteCountry,
  updateAdminPassword,
  forceSync
} from '@/services/api';
import { Channel, Country, Category, AdminChannel, AdminCountry } from '@/types';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardFooter,
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
  X, 
  Flag, 
  Tv,
  Settings,
  RefreshCw,
  Globe
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
import AdminLogin from '@/components/AdminLogin';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('channels');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // For settings
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // For new items
  const [newChannel, setNewChannel] = useState<Omit<Channel, 'id'>>({
    name: '',
    logo: '',
    streamUrl: '',
    category: '',
    country: '',
    isFavorite: false
  });
  
  const [newCountry, setNewCountry] = useState<Omit<Country, 'id'>>({
    name: '',
    flag: '',
    image: ''
  });
  
  // For editing - convert to admin objects
  const [editableChannels, setEditableChannels] = useState<AdminChannel[]>([]);
  const [editableCountries, setEditableCountries] = useState<AdminCountry[]>([]);
  
  // Queries
  const { 
    data: channels,
    isLoading: isLoadingChannels
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    enabled: isAuthenticated
  });
  
  const { 
    data: countries,
    isLoading: isLoadingCountries
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    enabled: isAuthenticated
  });
  
  const { 
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isAuthenticated
  });

  // Use useEffect instead of onSuccess callback for handling the data
  useEffect(() => {
    if (channels) {
      setEditableChannels(channels.map(channel => ({ ...channel, isEditing: false })));
    }
  }, [channels]);

  useEffect(() => {
    if (countries) {
      setEditableCountries(countries.map(country => ({ ...country, isEditing: false })));
    }
  }, [countries]);
  
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

  const addCountryMutation = useMutation({
    mutationFn: addCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة البلد الجديد",
      });
      setNewCountry({
        name: '',
        flag: '',
        image: ''
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر إضافة البلد: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const updateCountryMutation = useMutation({
    mutationFn: updateCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات البلد بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر تحديث البلد: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteCountryMutation = useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف البلد بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر حذف البلد: ${error.message}`,
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
  
  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.name || !newCountry.flag || !newCountry.image) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    addCountryMutation.mutate(newCountry);
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
  
  const toggleEditCountry = (id: string) => {
    setEditableCountries(countries => countries.map(country => 
      country.id === id 
        ? { ...country, isEditing: !country.isEditing } 
        : country
    ));
  };
  
  const updateEditableCountry = (id: string, field: keyof AdminCountry, value: string) => {
    setEditableCountries(countries => countries.map(country => 
      country.id === id 
        ? { ...country, [field]: value } 
        : country
    ));
  };
  
  const saveCountryChanges = (country: AdminCountry) => {
    const { isEditing, ...countryData } = country;
    updateCountryMutation.mutate(countryData as Country);
    toggleEditCountry(country.id);
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "كلمة مرور غير صالحة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "كلمتا المرور غير متطابقتين",
        description: "يرجى التأكد من تطابق كلمتي المرور",
        variant: "destructive",
      });
      return;
    }
    
    try {
      updateAdminPassword(newPassword);
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "تعذر تغيير كلمة المرور",
        variant: "destructive",
      });
    }
  };
  
  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const success = await forceSync();
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['channels'] });
        queryClient.invalidateQueries({ queryKey: ['countries'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast({
          title: "تم المزامنة بنجاح",
          description: "تم تحديث البيانات من الخادم",
        });
      } else {
        toast({
          title: "فشلت المزامنة",
          description: "تعذر تحديث البيانات من الخادم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isLoadingChannels || isLoadingCountries || isLoadingCategories) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-muted-foreground">إدارة القنوات والبلدان في التطبيق</p>
        
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleForceSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة مع الخادم'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/remote-config">
              <Globe className="h-4 w-4" />
              <span>إعدادات التحديث عن بُعد</span>
            </Link>
          </Button>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="w-full mb-8">
          <TabsTrigger value="channels" className="w-1/3">
            <Tv className="mr-2 h-4 w-4" />
            <span>القنوات</span>
          </TabsTrigger>
          <TabsTrigger value="countries" className="w-1/3">
            <Flag className="mr-2 h-4 w-4" />
            <span>البلدان</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="w-1/3">
            <Settings className="mr-2 h-4 w-4" />
            <span>الإعدادات</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="countries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="h-5 w-5 ml-2" />
                <span>إضافة بلد جديد</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAddCountry}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="countryName" className="text-sm font-medium">اسم البلد</label>
                    <Input
                      id="countryName"
                      value={newCountry.name}
                      onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
                      placeholder="اسم البلد"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="flag" className="text-sm font-medium">رمز العلم (اموجي)</label>
                    <Input
                      id="flag"
                      value={newCountry.flag}
                      onChange={(e) => setNewCountry({...newCountry, flag: e.target.value})}
                      placeholder="🇪🇬"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="image" className="text-sm font-medium">صورة البلد (رابط)</label>
                    <Input
                      id="image"
                      value={newCountry.image}
                      onChange={(e) => setNewCountry({...newCountry, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      dir="ltr"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">إضافة البلد</Button>
              </form>
            </CardContent>
          </Card>
          
          <h2 className="text-xl font-bold mt-8 mb-4">قائمة البلدان ({editableCountries.length})</h2>
          
          <div className="space-y-4">
            {editableCountries.map(country => (
              <Card key={country.id}>
                <CardContent className="p-4">
                  {country.isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">اسم البلد</label>
                          <Input
                            value={country.name}
                            onChange={(e) => updateEditableCountry(country.id, 'name', e.target.value)}
                            dir="rtl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">رمز العلم (اموجي)</label>
                          <Input
                            value={country.flag}
                            onChange={(e) => updateEditableCountry(country.id, 'flag', e.target.value)}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">صورة البلد (رابط)</label>
                          <Input
                            value={country.image}
                            onChange={(e) => updateEditableCountry(country.id, 'image', e.target.value)}
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleEditCountry(country.id)}
                        >
                          <X className="h-4 w-4 ml-1" />
                          <span>إلغاء</span>
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => saveCountryChanges(country)}
                        >
                          <Save className="h-4 w-4 ml-1" />
                          <span>حفظ</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 ml-4 text-5xl">
                        {country.flag}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg">{country.name}</h3>
                        <div className="text-sm truncate text-muted-foreground">
                          <span dir="ltr">{country.image}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleEditCountry(country.id)}
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
                              <AlertDialogTitle>هل أنت متأكد من حذف هذا البلد؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف "{country.name}" نهائيًا ولا يمكن التراجع عن هذا الإجراء. لن تتمكن من حذف البلد إذا كانت هناك قنوات مرتبطة به.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteCountryMutation.mutate(country.id)}
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
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 ml-2" />
                <span>تغيير كلمة المرور</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">كلمة المرور الجديدة</label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="كلمة المرور الجديدة"
                      dir="rtl"
                    />
                    <p className="text-xs text-muted-foreground">كلمة المرور يجب أن تكون 6 أحرف على الأقل</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">تأكيد كلمة المرور</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="تأكيد كلمة المرور"
                      dir="rtl"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">تغيير كلمة المرور</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
