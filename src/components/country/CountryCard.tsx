
import React from 'react';
import { Country } from '@/types';

interface CountryCardProps {
  country: Country;
  onClick: (countryId: string) => void;
  isActive?: boolean;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, onClick, isActive }) => {
  return (
    <button 
      onClick={() => onClick(country.id)}
      className="relative overflow-hidden rounded-xl w-full"
    >
      {/* الخلفية البنفسجية */}
      <div className="absolute inset-0 bg-[#8E44AD] rounded-xl z-0"></div>
      
      {/* صورة العلم */}
      <div className="aspect-[4/3] relative z-10 mb-0 p-2">
        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
          <img 
            src={country.image} 
            alt={country.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
            }}
          />
        </div>
      </div>
      
      {/* اسم البلد */}
      <div className="py-3 px-2 text-center relative z-10">
        <h3 className="text-white font-bold text-lg mb-0">
          {country.name} | {country.flag}
        </h3>
      </div>
    </button>
  );
};

export default CountryCard;
