
import React from 'react';
import { Tv } from 'lucide-react';

interface ChannelLogoProps {
  logo?: string;
  name: string;
}

const ChannelLogo: React.FC<ChannelLogoProps> = ({ logo, name }) => {
  return (
    <div className="flex justify-center mb-4 mt-2">
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* إضافة تأثير التوهج خلف الشعار */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {logo ? (
          <img 
            src={logo} 
            alt={name} 
            className="max-w-full max-h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
            }}
          />
        ) : (
          <Tv className="h-10 w-10 text-gray-400 relative z-10 transition-transform duration-500 group-hover:scale-110" />
        )}
        
        {/* إضافة تأثير الظل الخفيف */}
        <div className="absolute inset-0 shadow-inner"></div>
      </div>
    </div>
  );
};

export default ChannelLogo;
