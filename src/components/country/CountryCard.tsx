
import React from 'react';
import { Country } from '@/types';

interface CountryCardProps {
  country: Country;
  onClick: (countryId: string) => void;
  isActive?: boolean;
  isTV?: boolean;
  isFocused?: boolean;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, onClick, isActive, isTV, isFocused }) => {
  return (
    <button 
      onClick={() => onClick(country.id)}
      className={`relative overflow-hidden h-36 sm:h-40 group rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${isActive ? 'ring-4 ring-primary/60' : 'hover:ring-2 hover:ring-primary/30'} ${isFocused ? 'tv-focus-item' : ''} w-full`}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90 z-10"></div>
      
      {/* Background image */}
      <img 
        src={country.image} 
        alt={country.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
        }}
      />
      
      {/* Country information */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center p-3">
          <p className="text-white/90 text-3xl mb-1 transform transition-transform duration-300 group-hover:scale-110">{country.flag}</p>
          <h3 className={`text-white font-bold text-xl text-center shadow-text px-2 transform transition-transform duration-300 group-hover:scale-105 ${isTV ? 'tv-text' : ''}`}>{country.name}</h3>
        </div>
      </div>
      
      {/* Interactive elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-20"></div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 z-10"></div>
    </button>
  );
};

export default CountryCard;
