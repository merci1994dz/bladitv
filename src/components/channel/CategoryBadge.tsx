
import React from 'react';

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  if (!category) return null;
  
  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/60 dark:to-gray-700/60 px-3 py-1 rounded-full text-xs text-center mb-3 line-clamp-1 text-gray-600 dark:text-gray-300 shadow-sm transition-all duration-300 hover:shadow-md">
      {category}
    </div>
  );
};

export default CategoryBadge;
