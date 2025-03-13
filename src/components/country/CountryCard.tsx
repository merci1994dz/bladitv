
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
      className={`relative overflow-hidden h-32 sm:h-36 group rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-2 ${isActive ? 'border-primary' : 'border-transparent'} w-full`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
      <img 
        src={country.image} 
        alt={country.name}
        className="absolute inset-0 w-full h-full object-cover z-[-1] transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-white font-bold text-xl text-center shadow-text px-2 transform transition-transform duration-300 group-hover:scale-110">{country.name}</h3>
          <p className="text-white/90 text-2xl mt-1">{country.flag}</p>
        </div>
      </div>
      {/* إضافة شريط تفاعلي عند مرور المؤشر */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </button>
  );
};

export default CountryCard;
