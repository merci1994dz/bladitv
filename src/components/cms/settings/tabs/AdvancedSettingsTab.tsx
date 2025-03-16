
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '../SettingsProvider';

const AdvancedSettingsTab: React.FC = () => {
  const { settings, updateSettingValue } = useSettings();
  
  if (!settings) return null;
  
  return (
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
  );
};

export default AdvancedSettingsTab;
