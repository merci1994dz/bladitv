
import React from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Tv, Flag, Settings } from 'lucide-react';
import ChannelsTab from './ChannelsTab';
import CountriesTab from './CountriesTab';
import SettingsTab from './SettingsTab';

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
      <TabsList className="w-full mb-8">
        <TabsTrigger value="channels" className="w-1/3">
          <Tv className="mr-2 h-4 w-4" />
          <span>القنوات</span>
        </TabsTrigger>
        <TabsTrigger value="countries" className="w-1/3">
          <Flag className="mr-2 h-4 w-4" />
          <span>البلدان</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="w-1/3">
          <Settings className="mr-2 h-4 w-4" />
          <span>الإعدادات</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="channels">
        <ChannelsTab />
      </TabsContent>
      
      <TabsContent value="countries">
        <CountriesTab />
      </TabsContent>
      
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
