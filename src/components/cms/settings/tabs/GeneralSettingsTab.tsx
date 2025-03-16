
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '../SettingsProvider';

const GeneralSettingsTab: React.FC = () => {
  const { settings, updateSettingValue } = useSettings();
  
  if (!settings) return null;
  
  return (
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
  );
};

export default GeneralSettingsTab;
