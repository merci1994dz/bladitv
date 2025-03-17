
import { CMSSettings } from '../types';
import { getCMSSettings, saveCMSSettings } from '../storage/settings';

// تحديث إعدادات CMS
export const updateSettings = (settings: Partial<CMSSettings>): CMSSettings => {
  const currentSettings = getCMSSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  saveCMSSettings(updatedSettings);
  return updatedSettings;
};
