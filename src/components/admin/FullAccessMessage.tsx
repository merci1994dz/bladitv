
import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullAccessMessageProps {
  hasFullAccessEnabled: boolean;
}

const FullAccessMessage: React.FC<FullAccessMessageProps> = ({ hasFullAccessEnabled }) => {
  if (!hasFullAccessEnabled) return null;
  
  return (
    <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md p-3 mb-4 text-center animate-pulse">
      <div className="flex justify-center items-center gap-2 mb-1 text-green-600 dark:text-green-400">
        <Shield className="h-5 w-5" />
        <span className="font-bold">الصلاحيات الكاملة مفعلة</span>
      </div>
      <p className="text-sm text-green-600 dark:text-green-400">
        تم تفعيل صلاحيات المسؤول الكاملة. لا يلزم إعادة تسجيل الدخول لمدة 6 أشهر.
      </p>
    </div>
  );
};

export default FullAccessMessage;
