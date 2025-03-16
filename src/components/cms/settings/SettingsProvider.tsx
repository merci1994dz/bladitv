
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CMSSettings } from '@/services/cms/types';
import { getCMSSettings, saveCMSSettings, updateSettings } from '@/services/cms';
import { getSettingsFromFirebase, updateSettingsInFirebase } from '@/services/firebase/cms/settings';

// Create context for the settings
type SettingsContextType = {
  settings: CMSSettings | null;
  loading: boolean;
  savingSettings: boolean;
  storageType: 'local' | 'firebase';
  setStorageType: (type: 'local' | 'firebase') => void;
  updateSettingValue: <K extends keyof CMSSettings>(key: K, value: CMSSettings[K]) => void;
  saveSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CMSSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'firebase'>('local');

  // Load settings when component mounts or storage type changes
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        let loadedSettings;
        
        if (storageType === 'firebase') {
          loadedSettings = await getSettingsFromFirebase();
          if (!loadedSettings) {
            // If settings don't exist in Firebase, use local settings
            loadedSettings = getCMSSettings();
          }
        } else {
          loadedSettings = getCMSSettings();
        }
        
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "خطأ في التحميل",
          description: "تعذر تحميل إعدادات النظام، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [toast, storageType]);

  // Save settings
  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSavingSettings(true);
      
      if (storageType === 'firebase') {
        await updateSettingsInFirebase(settings);
      } else {
        saveCMSSettings(settings);
        updateSettings(settings);
      }
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات النظام بنجاح",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "تعذر حفظ إعدادات النظام، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Update a specific setting value
  const updateSettingValue = <K extends keyof CMSSettings>(key: K, value: CMSSettings[K]) => {
    if (!settings) return;
    
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const value: SettingsContextType = {
    settings,
    loading,
    savingSettings,
    storageType,
    setStorageType,
    updateSettingValue,
    saveSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
