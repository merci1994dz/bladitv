
import React from 'react';
import { Tv } from 'lucide-react';

interface ChannelLogoProps {
  logo?: string;
  name: string;
}

const ChannelLogo: React.FC<ChannelLogoProps> = ({ logo, name }) => {
  return (
    <div className="flex justify-center mb-4 mt-2">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 w-20 h-20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
        {logo ? (
          <img 
            src={logo} 
            alt={name} 
            className="max-w-full max-h-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TV';
            }}
          />
        ) : (
          <Tv className="h-10 w-10 text-gray-400" />
        )}
      </div>
    </div>
  );
};

export default ChannelLogo;
