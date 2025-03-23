
import { Category } from '@/types';
import { categories } from './dataStore';

export const getCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // استخدام طريقة معالجة أفضل للفئات المكررة قبل الإرجاع
  const uniqueCategories = filterDuplicateCategories([...categories]);
  return uniqueCategories;
};

// دالة محسنة لتصفية الفئات المكررة حسب المعرف
export const filterDuplicateCategories = (categoryList: Category[]): Category[] => {
  // استخدام Map للتخزين المؤقت لتحسين الأداء مع مجموعات البيانات الكبيرة
  const uniqueMap = new Map<string, Category>();
  
  // ترتيب الفئات حسب الأحدث (باستخدام الموضع في المصفوفة كمؤشر)
  categoryList.forEach((category, index) => {
    // التأكد من صحة المعرف قبل المعالجة
    if (!category.id || typeof category.id !== 'string') {
      console.warn('تم العثور على فئة بمعرف غير صالح:', category);
      return;
    }
    
    // الاحتفاظ بالإدخال الأول لكل معرف فريد
    if (!uniqueMap.has(category.id)) {
      uniqueMap.set(category.id, {
        ...category,
        // التأكد من أن الأيقونة موجودة دائمًا
        icon: category.icon || 'folder'
      });
    }
  });
  
  return Array.from(uniqueMap.values());
};
