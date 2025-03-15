
import React from 'react';
import { Settings } from 'lucide-react';
import SettingsCard from './settings/SettingsCard';
import PasswordChangeForm from './settings/PasswordChangeForm';

const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <SettingsCard title="تغيير كلمة المرور" icon={Settings}>
        <PasswordChangeForm />
      </SettingsCard>
    </div>
  );
};

export default SettingsTab;
