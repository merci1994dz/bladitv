
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from './constants';
import { CMSLayout } from '../../cms/types';

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
