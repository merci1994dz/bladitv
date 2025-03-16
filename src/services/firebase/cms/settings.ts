
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from './constants';
import { CMSSettings } from '../../cms/types';

// تحديث إعدادات CMS
export const updateSettingsInFirebase = async (settings: CMSSettings): Promise<CMSSettings> => {
  try {
    // استخدام معرف ثابت للإعدادات
    const settingsId = 'main-settings';
    
    // التحقق مما إذا كانت الإعدادات موجودة بالفعل
    const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, settingsId));
    
    if (settingsDoc.exists()) {
      await updateDoc(doc(db, COLLECTIONS.SETTINGS, settingsId), { ...settings });
    } else {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, settingsId), { ...settings });
    }
    
    return settings;
  } catch (error) {
    console.error('خطأ في تحديث الإعدادات في Firebase:', error);
    throw error;
  }
};

// جلب إعدادات CMS
export const getSettingsFromFirebase = async (): Promise<CMSSettings | null> => {
  try {
    const settingsId = 'main-settings';
    const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, settingsId));
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as CMSSettings;
    }
    
    return null;
  } catch (error) {
    console.error('خطأ في جلب الإعدادات من Firebase:', error);
    throw error;
  }
};
