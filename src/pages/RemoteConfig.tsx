
import React, { useState } from 'react';
import AdminLogin from '@/components/AdminLogin';
import RemoteConfigHeader from '@/components/remoteConfig/RemoteConfigHeader';
import RemoteConfigForm from '@/components/remoteConfig/RemoteConfigForm';
import JsonFormatHelp from '@/components/remoteConfig/JsonFormatHelp';
import { useRemoteConfig } from '@/hooks/useRemoteConfig';

const RemoteConfig: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const {
    remoteUrl,
    setRemoteUrl,
    lastSync,
    isSyncing,
    handleSaveConfig,
    handleSyncNow
  } = useRemoteConfig(isAuthenticated);
  
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <RemoteConfigHeader />
      
      <RemoteConfigForm 
        remoteUrl={remoteUrl}
        setRemoteUrl={setRemoteUrl}
        lastSync={lastSync}
        isSyncing={isSyncing}
        onSaveConfig={handleSaveConfig}
        onSyncNow={handleSyncNow}
      />
      
      <JsonFormatHelp />
    </div>
  );
};

export default RemoteConfig;
