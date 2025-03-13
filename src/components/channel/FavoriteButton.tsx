
import React from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  isFavorite, 
  onToggle,
  className = ""
}) => {
  return (
    <button 
      onClick={onToggle}
      className={`bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 text-gray-500 hover:text-red-500 focus:outline-none transition-colors backdrop-blur-sm shadow-md hover:shadow-lg ${className}`}
      aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
    >
      <Heart 
        fill={isFavorite ? "#ef4444" : "none"} 
        color={isFavorite ? "#ef4444" : "currentColor"} 
        size={18} 
      />
    </button>
  );
};

export default FavoriteButton;
