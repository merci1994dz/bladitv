
import React from 'react';
import { Button } from '@/components/ui/button';

const SettingsError: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <p className="text-destructive text-lg mb-4">تعذر تحميل الإعدادات</p>
      <Button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</Button>
    </div>
  );
};

export default SettingsError;
