
import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { NetworkStatusBar } from '@/components/connectivity';
import HomeSync from './HomeSync';

interface HomeHeaderProps {
  refetchChannels: () => Promise<any>;
  onRetryConnection: () => Promise<void>;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ 
  refetchChannels, 
  onRetryConnection 
}) => {
  return (
    <div className="tv-header">
      <div className="flex items-center">
        <button className="tv-icon-button mr-2">
          <Menu size={24} />
        </button>
        <h1 className="tv-header-title">Bladi TV</h1>
      </div>
      <div className="tv-header-actions">
        {/* مؤشر حالة الاتصال المحسن */}
        <NetworkStatusBar compact={true} onRefresh={onRetryConnection} />
        <HomeSync refetchChannels={refetchChannels} />
        <button className="tv-icon-button">
          <Bell size={20} />
        </button>
        <button className="tv-icon-button">
          <Search size={20} />
        </button>
      </div>
    </div>
  );
};

export default HomeHeader;
