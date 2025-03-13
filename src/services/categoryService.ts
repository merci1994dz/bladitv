
import { Category } from '@/types';
import { categories } from './dataStore';

export const getCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...categories];
};
