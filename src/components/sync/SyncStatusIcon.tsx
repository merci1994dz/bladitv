
import React from 'react';
import { Clock, RefreshCw, AlertTriangle, CloudOff, CheckCircle } from 'lucide-react';

interface SyncStatusIconProps {
  isRecent: boolean;
  isVeryOld: boolean;
  noSync?: boolean;
  isActive?: boolean;
  className?: string; // Added className prop for more flexibility
  size?: 'sm' | 'md' | 'lg'; // Added size prop
}

const SyncStatusIcon: React.FC<SyncStatusIconProps> = ({ 
  isRecent, 
  isVeryOld,
  noSync = false,
  isActive = false,
  className = '',
  size = 'md'
}) => {
  // Determine icon size based on the size prop
  const iconSize = {
    'sm': 'w-3 h-3',
    'md': 'w-4 h-4',
    'lg': 'w-5 h-5'
  }[size];
  
  // Base className for all icons
  const baseClassName = `${iconSize} ${className}`;
  
  if (isActive) {
    return <RefreshCw className={`${baseClassName} text-primary animate-spin`} />;
  }
  
  if (noSync) {
    return <CloudOff className={`${baseClassName} text-red-500`} />;
  }
  
  if (isRecent) {
    return <CheckCircle className={`${baseClassName} text-green-500`} />;
  } 
  
  if (isVeryOld) {
    return <AlertTriangle className={`${baseClassName} text-amber-500`} />;
  }
  
  return <Clock className={`${baseClassName} text-gray-500`} />;
};

export default SyncStatusIcon;
