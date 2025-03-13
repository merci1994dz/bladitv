
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "جاري تحميل البيانات...",
  size = 'md' 
}) => {
  // Determine the spinner size based on the size prop
  const spinnerSizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-background to-muted/30">
      <div className="flex flex-col items-center animate-pulse">
        <div className={`${spinnerSizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}></div>
        <p className="mt-4 text-primary font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
