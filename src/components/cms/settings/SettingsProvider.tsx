
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CMSSettings } from '@/services/cms/types';
import { getCMSSettings, saveCMSSettings, updateSettings } from '@/services/cms';
import { getSettingsFromSupabase, updateSettingsInSupabase } from '@/services/supabase/settings';
import { supabase } from '@/integrations/supabase/client';

// Create context for the settings
type SettingsContextType = {
  settings: CMSSettings | null;
  loading: boolean;
  savingSettings: boolean;
  storageType: 'local' | 'supabase';
  setStorageType: (type: 'local' | 'supabase') => void;
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
  const [storageType, setStorageType] = useState<'local' | 'supabase'>('supabase');

  // Load settings when component mounts or storage type changes
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        let loadedSettings;
        
        if (storageType === 'supabase') {
          loadedSettings = await getSettingsFromSupabase();
          if (!loadedSettings) {
            // If settings don't exist in Supabase, use local settings
            loadedSettings = getCMSSettings();
            // And try to save them to Supabase
            try {
              await updateSettingsInSupabase(loadedSettings);
            } catch (e) {
              console.warn('تعذر حفظ الإعدادات في Supabase:', e);
            }
          }
        } else {
          loadedSettings = getCMSSettings();
        }
        
        setSettings(loadedSettings);
      } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
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

  // إعداد الاستماع للتغييرات في الوقت الحقيقي
  useEffect(() => {
    if (storageType !== 'supabase') return;
    
    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'settings' }, 
        async () => {
          console.log('تم استلام تحديث للإعدادات من Supabase');
          const updatedSettings = await getSettingsFromSupabase();
          if (updatedSettings) {
            setSettings(updatedSettings);
            
            // تحديث التخزين المحلي أيضًا
            saveCMSSettings(updatedSettings);
            updateSettings(updatedSettings);
            
            toast({
              title: "تم تحديث الإعدادات",
              description: "تم تحديث إعدادات النظام تلقائيًا من Supabase",
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [storageType, toast]);

  // Save settings
  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSavingSettings(true);
      
      if (storageType === 'supabase') {
        await updateSettingsInSupabase(settings);
      } else {
        saveCMSSettings(settings);
        updateSettings(settings);
      }
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات النظام بنجاح",
      });
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
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
