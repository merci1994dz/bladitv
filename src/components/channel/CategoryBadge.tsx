
import React from 'react';

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  if (!category) return null;
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800/60 px-2 py-0.5 rounded-full text-xs text-center mb-3 line-clamp-1 text-gray-600 dark:text-gray-300">
      {category}
    </div>
  );
};

export default CategoryBadge;
