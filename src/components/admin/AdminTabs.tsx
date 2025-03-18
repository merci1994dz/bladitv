
import React from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Tv, Flag, Settings } from 'lucide-react';

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="mt-8">
      <TabsList className="w-full mb-8 p-1 bg-background/80 backdrop-blur-sm border border-border/50 shadow-md rounded-lg">
        <TabsTrigger 
          value="channels" 
          className={`w-1/3 transition-all duration-300 ${activeTab === 'channels' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Tv className="mr-2 h-4 w-4" />
          <span>القنوات</span>
        </TabsTrigger>
        <TabsTrigger 
          value="countries" 
          className={`w-1/3 transition-all duration-300 ${activeTab === 'countries' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Flag className="mr-2 h-4 w-4" />
          <span>البلدان</span>
        </TabsTrigger>
        <TabsTrigger 
          value="settings" 
          className={`w-1/3 transition-all duration-300 ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>الإعدادات</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AdminTabs;
