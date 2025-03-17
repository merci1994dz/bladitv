
import { CMSContentBlock, CMSLayout } from '../types';
import { getCMSContentBlocks, saveCMSContentBlocks } from '../storage/contentBlocks';
import { getCMSLayouts, saveCMSLayouts } from '../storage/layouts';

// إضافة كتلة محتوى جديدة
export const addContentBlock = (block: Omit<CMSContentBlock, 'id' | 'createdAt' | 'updatedAt'>): CMSContentBlock => {
  const blocks = getCMSContentBlocks();
  const newBlock: CMSContentBlock = {
    ...block,
    id: `block-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  blocks.push(newBlock);
  saveCMSContentBlocks(blocks);
  return newBlock;
};

// تحديث كتلة محتوى
export const updateContentBlock = (block: CMSContentBlock): CMSContentBlock => {
  const blocks = getCMSContentBlocks();
  const index = blocks.findIndex(b => b.id === block.id);
  
  if (index !== -1) {
    const updatedBlock = {
      ...block,
      updatedAt: new Date().toISOString()
    };
    
    blocks[index] = updatedBlock;
    saveCMSContentBlocks(blocks);
    return updatedBlock;
  }
  
  throw new Error(`لم يتم العثور على كتلة محتوى بالمعرف ${block.id}`);
};

// حذف كتلة محتوى
export const deleteContentBlock = (blockId: string): boolean => {
  const blocks = getCMSContentBlocks();
  const index = blocks.findIndex(b => b.id === blockId);
  
  if (index !== -1) {
    blocks.splice(index, 1);
    saveCMSContentBlocks(blocks);
    
    // تحديث أي تخطيطات تستخدم هذه الكتلة
    const layouts = getCMSLayouts();
    let layoutsUpdated = false;
    
    layouts.forEach(layout => {
      const blockIndex = layout.blocks.indexOf(blockId);
      if (blockIndex !== -1) {
        layout.blocks.splice(blockIndex, 1);
        layout.updatedAt = new Date().toISOString();
        layoutsUpdated = true;
      }
    });
    
    if (layoutsUpdated) {
      saveCMSLayouts(layouts);
    }
    
    return true;
  }
  
  return false;
};

// الحصول على كتل المحتوى لتخطيط معين
export const getContentBlocksForLayout = (layoutId: string): CMSContentBlock[] => {
  const layout = getCMSLayouts().find(l => l.id === layoutId);
  
  if (!layout) {
    return [];
  }
  
  const allBlocks = getCMSContentBlocks();
  return allBlocks
    .filter(block => layout.blocks.includes(block.id) && block.active)
    .sort((a, b) => {
      // الترتيب حسب الموضع في التخطيط
      const posA = layout.blocks.indexOf(a.id);
      const posB = layout.blocks.indexOf(b.id);
      return posA - posB;
    });
};
