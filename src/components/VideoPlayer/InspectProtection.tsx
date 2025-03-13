
import React, { useEffect } from 'react';
import { VIDEO_PLAYER, SECURITY_CONFIG } from '@/services/config';

const InspectProtection: React.FC = () => {
  useEffect(() => {
    if (SECURITY_CONFIG.DISABLE_INSPECT) {
      const disableDevTools = () => {
        document.addEventListener('keydown', (e) => {
          if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) || 
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
          ) {
            e.preventDefault();
          }
        });
      };
      
      disableDevTools();
    }
  }, []);

  return null;
};

export default InspectProtection;
