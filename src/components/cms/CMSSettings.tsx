
import React from 'react';
import { SettingsProvider } from './settings/SettingsProvider';
import SettingsHeader from './settings/SettingsHeader';
import SettingsTabs from './settings/SettingsTabs';
import SettingsActions from './settings/SettingsActions';
import SettingsLoading from './settings/SettingsLoading';
import SettingsError from './settings/SettingsError';
import { useSettings } from './settings/SettingsProvider';

// This component uses the settings context and renders the appropriate UI
const SettingsContent: React.FC = () => {
  const { loading, settings } = useSettings();

  if (loading) {
    return <SettingsLoading />;
  }

  if (!settings) {
    return <SettingsError />;
  }

  return (
    <>
      <SettingsHeader />
      <SettingsTabs />
      <SettingsActions />
    </>
  );
};

// Main component that wraps everything with the SettingsProvider
const CMSSettings: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <SettingsProvider>
        <SettingsContent />
      </SettingsProvider>
    </div>
  );
};

export default CMSSettings;
