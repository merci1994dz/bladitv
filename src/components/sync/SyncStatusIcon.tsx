
import React from 'react';
import { Clock, RefreshCw, AlertTriangle, CloudOff } from 'lucide-react';

interface SyncStatusIconProps {
  isRecent: boolean;
  isVeryOld: boolean;
  noSync?: boolean;
}

const SyncStatusIcon: React.FC<SyncStatusIconProps> = ({ 
  isRecent, 
  isVeryOld,
  noSync = false
}) => {
  if (noSync) {
    return <CloudOff className="w-4 h-4 text-red-500" />;
  }
  
  if (isRecent) {
    return <RefreshCw className="w-4 h-4 text-green-500" />;
  } 
  
  if (isVeryOld) {
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  }
  
  return <Clock className="w-4 h-4 text-gray-500" />;
};

export default SyncStatusIcon;
