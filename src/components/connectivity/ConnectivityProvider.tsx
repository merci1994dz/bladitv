
import React, { createContext, useContext, ReactNode } from 'react';
import { useConnectivity } from '@/hooks/useConnectivity';
import OfflineMode from './OfflineMode';
import { useToast } from '@/hooks/use-toast';

// Define the context type
interface ConnectivityContextType {
  isOnline: boolean;
  isOffline: boolean;
  hasServerAccess: boolean;
  isChecking: boolean;
  connectionType: 'full' | 'limited' | 'none';
  checkStatus: () => Promise<any>;
  statusMessage: string;
  lastCheckTime: number;
}

// Create context with default values
const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: true,
  isOffline: false,
  hasServerAccess: true,
  isChecking: false,
  connectionType: 'full',
  checkStatus: async () => ({}),
  statusMessage: '',
  lastCheckTime: 0
});

interface ConnectivityProviderProps {
  children: ReactNode;
  showOfflineNotification?: boolean;
  checkInterval?: number;
  showToasts?: boolean;
}

export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = ({
  children,
  showOfflineNotification = true,
  checkInterval = 60000,
  showToasts = true
}) => {
  const { toast } = useToast();
  const connectivity = useConnectivity({
    showNotifications: showToasts,
    checkInterval,
    onStatusChange: (status) => {
      // You can add additional logging or actions here when status changes
      console.debug('Connectivity status changed:', status);
    }
  });

  // Handle reconnection attempts
  const handleReconnect = async () => {
    toast({
      title: "جاري إعادة الاتصال",
      description: "جاري محاولة إعادة الاتصال بالإنترنت والمصادر...",
      duration: 3000,
    });
    
    await connectivity.checkStatus();
  };

  return (
    <ConnectivityContext.Provider value={connectivity}>
      {showOfflineNotification && connectivity.isOffline && (
        <OfflineMode 
          isOffline={connectivity.isOffline}
          onReconnect={handleReconnect}
          isReconnecting={connectivity.isChecking}
          minimal={true}
        />
      )}
      {children}
    </ConnectivityContext.Provider>
  );
};

// Hook for using the connectivity context
export const useConnectivityContext = () => useContext(ConnectivityContext);

export default ConnectivityProvider;
