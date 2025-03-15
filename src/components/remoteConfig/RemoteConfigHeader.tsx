
import React from 'react';
import { Globe } from 'lucide-react';

const RemoteConfigHeader: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-2">إعدادات التحديث عن بُعد</h1>
      <p className="text-muted-foreground">
        إعداد مصدر خارجي لتحديث بيانات القنوات والبلدان والفئات
      </p>
    </header>
  );
};

export default RemoteConfigHeader;
