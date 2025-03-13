
import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Palette, 
  Monitor, 
  Languages, 
  EyeOff, 
  SquareSlash,
  ArrowUpDown,
  Type
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeviceType } from '@/hooks/use-tv';
import { Button } from '@/components/ui/button';

interface InterfaceSettingsProps {
  onSave?: (settings: any) => void;
}

const InterfaceSettings: React.FC<InterfaceSettingsProps> = ({ onSave }) => {
  const { isTV } = useDeviceType();
  const [currentTab, setCurrentTab] = useState('display');
  
  // إعدادات افتراضية
  const [settings, setSettings] = useState({
    display: {
      darkMode: true,
      fontSize: 16,
      cardSize: 'medium',
      animationsEnabled: true
    },
    layout: {
      gridColumns: 4,
      showCategories: true,
      showCountryFlags: true,
      compactMode: false
    },
    languages: {
      appLanguage: 'ar',
      showInternationalChannels: true
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
      largerText: false,
      enhancedFocus: isTV
    }
  });

  const updateSetting = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    
    // حفظ الإعدادات في التخزين المحلي
    localStorage.setItem('user_interface_settings', JSON.stringify(settings));
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${isTV ? 'tv-component p-2' : ''}`}>
      <h2 className={`font-bold mb-6 ${isTV ? 'text-2xl tv-text' : 'text-xl'}`}>
        إعدادات الواجهة
      </h2>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className={`grid grid-cols-4 mb-6 ${isTV ? 'p-2' : ''}`}>
          <TabsTrigger 
            value="display" 
            className={isTV ? 'tv-focus-item text-lg py-3' : ''}
          >
            <Monitor className="w-4 h-4 mr-2" />
            <span>الشاشة</span>
          </TabsTrigger>
          <TabsTrigger 
            value="layout"
            className={isTV ? 'tv-focus-item text-lg py-3' : ''}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            <span>التخطيط</span>
          </TabsTrigger>
          <TabsTrigger 
            value="languages"
            className={isTV ? 'tv-focus-item text-lg py-3' : ''}
          >
            <Languages className="w-4 h-4 mr-2" />
            <span>اللغات</span>
          </TabsTrigger>
          <TabsTrigger 
            value="accessibility"
            className={isTV ? 'tv-focus-item text-lg py-3' : ''}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            <span>سهولة الوصول</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات العرض</CardTitle>
              <CardDescription>تخصيص مظهر التطبيق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الوضع الداكن</Label>
                  <div className="text-sm text-muted-foreground">تفعيل مظهر داكن للتطبيق</div>
                </div>
                <Switch 
                  checked={settings.display.darkMode}
                  onCheckedChange={(checked) => updateSetting('display', 'darkMode', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>حجم الخط</Label>
                  <span className="text-sm text-muted-foreground">{settings.display.fontSize}px</span>
                </div>
                <Slider 
                  value={[settings.display.fontSize]} 
                  min={12} 
                  max={24} 
                  step={1}
                  onValueChange={(value) => updateSetting('display', 'fontSize', value[0])}
                  className={isTV ? 'tv-focus-item h-8' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label>حجم البطاقات</Label>
                <RadioGroup 
                  value={settings.display.cardSize} 
                  onValueChange={(value) => updateSetting('display', 'cardSize', value)}
                  className="flex space-x-2 rtl:space-x-reverse"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="small" id="card-small" className={isTV ? 'tv-focus-item scale-125' : ''} />
                    <Label htmlFor="card-small">صغير</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="medium" id="card-medium" className={isTV ? 'tv-focus-item scale-125' : ''} />
                    <Label htmlFor="card-medium">متوسط</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="large" id="card-large" className={isTV ? 'tv-focus-item scale-125' : ''} />
                    <Label htmlFor="card-large">كبير</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الرسوم المتحركة</Label>
                  <div className="text-sm text-muted-foreground">تمكين تأثيرات الحركة بالواجهة</div>
                </div>
                <Switch 
                  checked={settings.display.animationsEnabled}
                  onCheckedChange={(checked) => updateSetting('display', 'animationsEnabled', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>تخطيط التطبيق</CardTitle>
              <CardDescription>تنظيم عرض العناصر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>عدد الأعمدة في الشبكة</Label>
                  <span className="text-sm text-muted-foreground">{settings.layout.gridColumns}</span>
                </div>
                <Slider 
                  value={[settings.layout.gridColumns]} 
                  min={2} 
                  max={8} 
                  step={1}
                  onValueChange={(value) => updateSetting('layout', 'gridColumns', value[0])}
                  className={isTV ? 'tv-focus-item h-8' : ''}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إظهار التصنيفات</Label>
                  <div className="text-sm text-muted-foreground">عرض فئات القنوات</div>
                </div>
                <Switch 
                  checked={settings.layout.showCategories}
                  onCheckedChange={(checked) => updateSetting('layout', 'showCategories', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إظهار أعلام الدول</Label>
                  <div className="text-sm text-muted-foreground">عرض أعلام الدول مع القنوات</div>
                </div>
                <Switch 
                  checked={settings.layout.showCountryFlags}
                  onCheckedChange={(checked) => updateSetting('layout', 'showCountryFlags', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الوضع المدمج</Label>
                  <div className="text-sm text-muted-foreground">عرض المزيد من العناصر في مساحة أقل</div>
                </div>
                <Switch 
                  checked={settings.layout.compactMode}
                  onCheckedChange={(checked) => updateSetting('layout', 'compactMode', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات اللغة</CardTitle>
              <CardDescription>اختيار لغة التطبيق والمحتوى</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>لغة التطبيق</Label>
                <Select 
                  value={settings.languages.appLanguage}
                  onValueChange={(value) => updateSetting('languages', 'appLanguage', value)}
                >
                  <SelectTrigger className={isTV ? 'tv-focus-item text-lg p-4' : ''}>
                    <SelectValue placeholder="اختر اللغة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>عرض القنوات الدولية</Label>
                  <div className="text-sm text-muted-foreground">عرض القنوات بلغات أخرى</div>
                </div>
                <Switch 
                  checked={settings.languages.showInternationalChannels}
                  onCheckedChange={(checked) => updateSetting('languages', 'showInternationalChannels', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات سهولة الوصول</CardTitle>
              <CardDescription>جعل التطبيق أكثر سهولة للاستخدام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>التباين العالي</Label>
                  <div className="text-sm text-muted-foreground">تحسين قراءة النصوص</div>
                </div>
                <Switch 
                  checked={settings.accessibility.highContrast}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'highContrast', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تقليل الحركة</Label>
                  <div className="text-sm text-muted-foreground">تقليل الرسوم المتحركة والتأثيرات</div>
                </div>
                <Switch 
                  checked={settings.accessibility.reduceMotion}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'reduceMotion', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>نص أكبر</Label>
                  <div className="text-sm text-muted-foreground">زيادة حجم النص لتسهيل القراءة</div>
                </div>
                <Switch 
                  checked={settings.accessibility.largerText}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'largerText', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تحسين التركيز</Label>
                  <div className="text-sm text-muted-foreground">تحسين مؤشرات التركيز لأجهزة التلفزيون</div>
                </div>
                <Switch 
                  checked={settings.accessibility.enhancedFocus}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'enhancedFocus', checked)}
                  className={isTV ? 'tv-focus-item scale-125' : ''}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleSave}
          className={`bg-primary ${isTV ? 'tv-focus-item text-lg px-8 py-6' : ''}`}
        >
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
};

export default InterfaceSettings;
