
import { Category } from '@/types';
import { categories } from './dataStore';

export const getCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Filter out duplicate categories by ID before returning
  const uniqueCategories = filterDuplicateCategories([...categories]);
  return uniqueCategories;
};

// Utility function to filter duplicate categories by ID
export const filterDuplicateCategories = (categoryList: Category[]): Category[] => {
  const uniqueMap = new Map<string, Category>();
  
  categoryList.forEach(category => {
    if (!uniqueMap.has(category.id)) {
      uniqueMap.set(category.id, category);
    }
  });
  
  return Array.from(uniqueMap.values());
};
