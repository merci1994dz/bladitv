
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSettings } from './SettingsProvider';

const SettingsActions: React.FC = () => {
  const { saveSettings, savingSettings } = useSettings();
  
  return (
    <div className="mt-6 flex justify-end">
      <Button 
        onClick={saveSettings} 
        disabled={savingSettings}
        className="min-w-[120px]"
      >
        {savingSettings ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
            جاري الحفظ...
          </>
        ) : 'حفظ الإعدادات'}
      </Button>
    </div>
  );
};

export default SettingsActions;
