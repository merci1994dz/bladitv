
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import DisplaySettingsTab from './tabs/DisplaySettingsTab';
import AdvancedSettingsTab from './tabs/AdvancedSettingsTab';

const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full md:w-auto grid-cols-3 mb-4">
        <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
        <TabsTrigger value="display">العرض</TabsTrigger>
        <TabsTrigger value="advanced">متقدمة</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <GeneralSettingsTab />
      </TabsContent>
      
      <TabsContent value="display">
        <DisplaySettingsTab />
      </TabsContent>
      
      <TabsContent value="advanced">
        <AdvancedSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
