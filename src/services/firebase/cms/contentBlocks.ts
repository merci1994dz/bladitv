
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from './constants';
import { CMSContentBlock } from '../../cms/types';

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
