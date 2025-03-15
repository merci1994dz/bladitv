
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';

// إضافة أو تحديث بيانات
export const setDocument = async (
  collectionName: string, 
  docId: string, 
  data: DocumentData
): Promise<void> => {
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
    throw error;
  }
};

// الحصول على وثيقة واحدة
export const getDocument = async (
  collectionName: string, 
  docId: string
): Promise<DocumentData | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('خطأ في قراءة البيانات:', error);
    throw error;
  }
};

// الحصول على جميع الوثائق في مجموعة
export const getCollection = async (
  collectionName: string
): Promise<DocumentData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('خطأ في قراءة المجموعة:', error);
    throw error;
  }
};

// حذف وثيقة
export const deleteDocument = async (
  collectionName: string, 
  docId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error('خطأ في حذف البيانات:', error);
    throw error;
  }
};
