
import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium', 
  className = '',
  text = 'جاري التحميل...'
}) => {
  // تحديد حجم المؤشر
  const sizeMap = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-10 w-10',
  };
  
  const iconSize = sizeMap[size];
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader className={`animate-spin ${iconSize} text-primary`} />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
};

export default LoadingIndicator;
