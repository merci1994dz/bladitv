
import React from 'react';

const SettingsLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="mr-3">جاري تحميل الإعدادات...</span>
    </div>
  );
};

export default SettingsLoading;
