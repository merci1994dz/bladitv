
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSettings } from './SettingsProvider';

const SettingsHeader: React.FC = () => {
  const { storageType, setStorageType } = useSettings();
  
  return (
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
  );
};

export default SettingsHeader;
