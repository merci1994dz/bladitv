
import React from 'react';
import { User } from 'lucide-react';

const EmptyUsersList: React.FC = () => {
  return (
    <div className="text-center py-8">
      <User className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">لا يوجد مستخدمون</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ابدأ بإضافة مستخدم جديد لإدارة التطبيق.</p>
    </div>
  );
};

export default EmptyUsersList;
