
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
    return <CloudOff className="w-3 h-3" />;
  }
  
  if (isRecent) {
    return <RefreshCw className="w-3 h-3 text-green-500" />;
  } 
  
  if (isVeryOld) {
    return <AlertTriangle className="w-3 h-3 text-amber-500" />;
  }
  
  return <Clock className="w-3 h-3" />;
};

export default SyncStatusIcon;
