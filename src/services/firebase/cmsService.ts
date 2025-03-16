
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './config';
import { 
  CMSUser, 
  CMSContentBlock, 
  CMSLayout, 
  CMSSchedule, 
  CMSSettings 
} from '../cms/types';

// أسماء المجموعات في Firestore
const COLLECTIONS = {
  USERS: 'cms_users',
  CONTENT_BLOCKS: 'cms_content_blocks',
  LAYOUTS: 'cms_layouts',
  SCHEDULES: 'cms_schedules',
  SETTINGS: 'cms_settings'
};

// ----------------------
// إدارة المستخدمين
// ----------------------

// إضافة مستخدم جديد
export const addUserToFirebase = async (user: Omit<CMSUser, 'id'>): Promise<CMSUser> => {
  try {
    const newUser: CMSUser = {
      ...user,
      id: `user-${Date.now()}`
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, newUser.id), newUser);
    return newUser;
  } catch (error) {
    console.error('خطأ في إضافة المستخدم إلى Firebase:', error);
    throw error;
  }
};

// جلب جميع المستخدمين
export const getUsersFromFirebase = async (): Promise<CMSUser[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users: CMSUser[] = [];
    
    usersSnapshot.forEach((doc) => {
      users.push(doc.data() as CMSUser);
    });
    
    return users;
  } catch (error) {
    console.error('خطأ في جلب المستخدمين من Firebase:', error);
    throw error;
  }
};

// تحديث مستخدم
export const updateUserInFirebase = async (user: CMSUser): Promise<CMSUser> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, user.id), { ...user });
    return user;
  } catch (error) {
    console.error('خطأ في تحديث المستخدم في Firebase:', error);
    throw error;
  }
};

// حذف مستخدم
export const deleteUserFromFirebase = async (userId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    return true;
  } catch (error) {
    console.error('خطأ في حذف المستخدم من Firebase:', error);
    throw error;
  }
};

// ----------------------
// إدارة كتل المحتوى
// ----------------------

// إضافة كتلة محتوى جديدة
export const addContentBlockToFirebase = async (
  block: Omit<CMSContentBlock, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CMSContentBlock> => {
  try {
    const newBlock: CMSContentBlock = {
      ...block,
      id: `block-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, COLLECTIONS.CONTENT_BLOCKS, newBlock.id), newBlock);
    return newBlock;
  } catch (error) {
    console.error('خطأ في إضافة كتلة المحتوى إلى Firebase:', error);
    throw error;
  }
};

// جلب جميع كتل المحتوى
export const getContentBlocksFromFirebase = async (): Promise<CMSContentBlock[]> => {
  try {
    const blocksSnapshot = await getDocs(collection(db, COLLECTIONS.CONTENT_BLOCKS));
    const blocks: CMSContentBlock[] = [];
    
    blocksSnapshot.forEach((doc) => {
      blocks.push(doc.data() as CMSContentBlock);
    });
    
    return blocks;
  } catch (error) {
    console.error('خطأ في جلب كتل المحتوى من Firebase:', error);
    throw error;
  }
};

// تحديث كتلة محتوى
export const updateContentBlockInFirebase = async (block: CMSContentBlock): Promise<CMSContentBlock> => {
  try {
    const updatedBlock = {
      ...block,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(doc(db, COLLECTIONS.CONTENT_BLOCKS, block.id), updatedBlock);
    return updatedBlock;
  } catch (error) {
    console.error('خطأ في تحديث كتلة المحتوى في Firebase:', error);
    throw error;
  }
};

// حذف كتلة محتوى
export const deleteContentBlockFromFirebase = async (blockId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CONTENT_BLOCKS, blockId));
    return true;
  } catch (error) {
    console.error('خطأ في حذف كتلة المحتوى من Firebase:', error);
    throw error;
  }
};

// ----------------------
// إدارة التخطيطات
// ----------------------

// إضافة تخطيط جديد
export const addLayoutToFirebase = async (
  layout: Omit<CMSLayout, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CMSLayout> => {
  try {
    const newLayout: CMSLayout = {
      ...layout,
      id: `layout-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // التحقق مما إذا كان التخطيط الجديد هو الافتراضي
    if (newLayout.isDefault) {
      // جلب جميع التخطيطات من نفس النوع
      const layoutsQuery = query(
        collection(db, COLLECTIONS.LAYOUTS), 
        where('type', '==', newLayout.type),
        where('isDefault', '==', true)
      );
      
      const layoutsSnapshot = await getDocs(layoutsQuery);
      
      // تحديث التخطيطات الافتراضية الأخرى
      const updatePromises = layoutsSnapshot.docs.map(doc => {
        return updateDoc(doc.ref, { 
          isDefault: false,
          updatedAt: new Date().toISOString()
        });
      });
      
      await Promise.all(updatePromises);
    }
    
    await setDoc(doc(db, COLLECTIONS.LAYOUTS, newLayout.id), newLayout);
    return newLayout;
  } catch (error) {
    console.error('خطأ في إضافة التخطيط إلى Firebase:', error);
    throw error;
  }
};

// جلب جميع التخطيطات
export const getLayoutsFromFirebase = async (): Promise<CMSLayout[]> => {
  try {
    const layoutsSnapshot = await getDocs(collection(db, COLLECTIONS.LAYOUTS));
    const layouts: CMSLayout[] = [];
    
    layoutsSnapshot.forEach((doc) => {
      layouts.push(doc.data() as CMSLayout);
    });
    
    return layouts;
  } catch (error) {
    console.error('خطأ في جلب التخطيطات من Firebase:', error);
    throw error;
  }
};

// تحديث تخطيط
export const updateLayoutInFirebase = async (layout: CMSLayout): Promise<CMSLayout> => {
  try {
    const updatedLayout = {
      ...layout,
      updatedAt: new Date().toISOString()
    };
    
    // التحقق مما إذا كان التخطيط المحدث هو الافتراضي
    if (updatedLayout.isDefault) {
      // جلب جميع التخطيطات من نفس النوع باستثناء هذا التخطيط
      const layoutsQuery = query(
        collection(db, COLLECTIONS.LAYOUTS), 
        where('type', '==', updatedLayout.type),
        where('isDefault', '==', true),
        where('id', '!=', updatedLayout.id)
      );
      
      const layoutsSnapshot = await getDocs(layoutsQuery);
      
      // تحديث التخطيطات الافتراضية الأخرى
      const updatePromises = layoutsSnapshot.docs.map(doc => {
        return updateDoc(doc.ref, { 
          isDefault: false,
          updatedAt: new Date().toISOString()
        });
      });
      
      await Promise.all(updatePromises);
    }
    
    await updateDoc(doc(db, COLLECTIONS.LAYOUTS, layout.id), updatedLayout);
    return updatedLayout;
  } catch (error) {
    console.error('خطأ في تحديث التخطيط في Firebase:', error);
    throw error;
  }
};

// حذف تخطيط
export const deleteLayoutFromFirebase = async (layoutId: string): Promise<boolean> => {
  try {
    // فحص ما إذا كان التخطيط افتراضيًا
    const layoutDoc = await getDoc(doc(db, COLLECTIONS.LAYOUTS, layoutId));
    if (!layoutDoc.exists()) {
      return false;
    }
    
    const layoutData = layoutDoc.data() as CMSLayout;
    if (layoutData.isDefault) {
      throw new Error('لا يمكن حذف التخطيط الافتراضي');
    }
    
    await deleteDoc(doc(db, COLLECTIONS.LAYOUTS, layoutId));
    
    // حذف أي جداول مرتبطة بهذا التخطيط
    const schedulesQuery = query(
      collection(db, COLLECTIONS.SCHEDULES), 
      where('layoutId', '==', layoutId)
    );
    
    const schedulesSnapshot = await getDocs(schedulesQuery);
    
    const deletePromises = schedulesSnapshot.docs.map(doc => {
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('خطأ في حذف التخطيط من Firebase:', error);
    throw error;
  }
};

// ----------------------
// إدارة جداول العرض
// ----------------------

// إضافة جدول عرض جديد
export const addScheduleToFirebase = async (schedule: Omit<CMSSchedule, 'id'>): Promise<CMSSchedule> => {
  try {
    const newSchedule: CMSSchedule = {
      ...schedule,
      id: `schedule-${Date.now()}`
    };
    
    await setDoc(doc(db, COLLECTIONS.SCHEDULES, newSchedule.id), newSchedule);
    return newSchedule;
  } catch (error) {
    console.error('خطأ في إضافة جدول العرض إلى Firebase:', error);
    throw error;
  }
};

// جلب جميع جداول العرض
export const getSchedulesFromFirebase = async (): Promise<CMSSchedule[]> => {
  try {
    const schedulesSnapshot = await getDocs(collection(db, COLLECTIONS.SCHEDULES));
    const schedules: CMSSchedule[] = [];
    
    schedulesSnapshot.forEach((doc) => {
      schedules.push(doc.data() as CMSSchedule);
    });
    
    return schedules;
  } catch (error) {
    console.error('خطأ في جلب جداول العرض من Firebase:', error);
    throw error;
  }
};

// تحديث جدول عرض
export const updateScheduleInFirebase = async (schedule: CMSSchedule): Promise<CMSSchedule> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.SCHEDULES, schedule.id), { ...schedule });
    return schedule;
  } catch (error) {
    console.error('خطأ في تحديث جدول العرض في Firebase:', error);
    throw error;
  }
};

// حذف جدول عرض
export const deleteScheduleFromFirebase = async (scheduleId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SCHEDULES, scheduleId));
    return true;
  } catch (error) {
    console.error('خطأ في حذف جدول العرض من Firebase:', error);
    throw error;
  }
};

// ----------------------
// إدارة الإعدادات
// ----------------------

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
