
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '../SettingsProvider';

const DisplaySettingsTab: React.FC = () => {
  const { settings, updateSettingValue } = useSettings();
  
  if (!settings) return null;
  
  return (
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
              onValueChange={(value) => updateSettingValue('theme', value as 'light' | 'dark' | 'auto')}
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
  );
};

export default DisplaySettingsTab;
