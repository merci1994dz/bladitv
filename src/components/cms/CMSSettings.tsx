
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCMSSettings, saveCMSSettings, updateSettings } from '@/services/cms';
import { getSettingsFromFirebase, updateSettingsInFirebase } from '@/services/firebase/cmsService';
import { CMSSettings as CMSSettingsType } from '@/services/cms/types';

const CMSSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CMSSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'firebase'>('local');

  // تحميل الإعدادات عند تحميل المكون
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        let loadedSettings;
        
        if (storageType === 'firebase') {
          loadedSettings = await getSettingsFromFirebase();
          if (!loadedSettings) {
            // إذا لم تكن الإعدادات موجودة في Firebase، نستخدم الإعدادات المحلية
            loadedSettings = getCMSSettings();
          }
        } else {
          loadedSettings = getCMSSettings();
        }
        
        setSettings(loadedSettings);
      } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
        toast({
          title: "خطأ في التحميل",
          description: "تعذر تحميل إعدادات النظام، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [toast, storageType]);

  // حفظ الإعدادات
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSavingSettings(true);
      
      if (storageType === 'firebase') {
        await updateSettingsInFirebase(settings);
      } else {
        saveCMSSettings(settings);
        updateSettings(settings);
      }
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات النظام بنجاح",
      });
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "تعذر حفظ إعدادات النظام، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // تحديث قيمة إعداد معين
  const updateSettingValue = (key: keyof CMSSettingsType, value: any) => {
    if (!settings) return;
    
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="mr-3">جاري تحميل الإعدادات...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive text-lg mb-4">تعذر تحميل الإعدادات</p>
        <Button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إعدادات نظام إدارة المحتوى</h1>
          <p className="text-muted-foreground">تخصيص إعدادات الموقع ونظام إدارة المحتوى</p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Label htmlFor="storage-type">تخزين في Firebase</Label>
          <Switch
            id="storage-type"
            checked={storageType === 'firebase'}
            onCheckedChange={(checked) => setStorageType(checked ? 'firebase' : 'local')}
          />
        </div>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-4">
          <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
          <TabsTrigger value="display">العرض</TabsTrigger>
          <TabsTrigger value="advanced">متقدمة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>إعدادات أساسية للموقع والتطبيق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">اسم الموقع</Label>
                  <Input
                    id="site-name"
                    value={settings.siteName}
                    onChange={(e) => updateSettingValue('siteName', e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="logo">رابط الشعار</Label>
                  <Input
                    id="logo"
                    value={settings.logo}
                    onChange={(e) => updateSettingValue('logo', e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="language">اللغة الافتراضية</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => updateSettingValue('language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                      <SelectItem value="fr">الفرنسية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات العرض</CardTitle>
              <CardDescription>تخصيص طريقة عرض المحتوى في الموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="theme">المظهر</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => updateSettingValue('theme', value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="اختر المظهر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="default-layout">التخطيط الافتراضي</Label>
                  <Input
                    id="default-layout"
                    value={settings.defaultLayout}
                    onChange={(e) => updateSettingValue('defaultLayout', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-categories">عرض الفئات في الصفحة الرئيسية</Label>
                  <Switch
                    id="show-categories"
                    checked={settings.showCategoriesOnHome}
                    onCheckedChange={(checked) => updateSettingValue('showCategoriesOnHome', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-countries">عرض الدول في الصفحة الرئيسية</Label>
                  <Switch
                    id="show-countries"
                    checked={settings.showCountriesOnHome}
                    onCheckedChange={(checked) => updateSettingValue('showCountriesOnHome', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات متقدمة</CardTitle>
              <CardDescription>إعدادات إضافية متقدمة للنظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="featured-limit">عدد القنوات المميزة</Label>
                  <Input
                    id="featured-limit"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.featuredChannelsLimit}
                    onChange={(e) => updateSettingValue('featuredChannelsLimit', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="recent-limit">عدد القنوات المشاهدة مؤخرًا</Label>
                  <Input
                    id="recent-limit"
                    type="number"
                    min="1"
                    max="12"
                    value={settings.recentlyWatchedLimit}
                    onChange={(e) => updateSettingValue('recentlyWatchedLimit', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics-enabled">تفعيل التحليلات</Label>
                  <Switch
                    id="analytics-enabled"
                    checked={settings.analyticEnabled}
                    onCheckedChange={(checked) => updateSettingValue('analyticEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={savingSettings}
          className="min-w-[120px]"
        >
          {savingSettings ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
              جاري الحفظ...
            </>
          ) : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
};

export default CMSSettings;
