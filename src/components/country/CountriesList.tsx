
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Country } from '@/types';
import CountryCard from './CountryCard';

interface CountriesListProps {
  countries: Country[];
  activeCountry: string | null;
  onCountryClick?: (countryId: string) => void;
}

const CountriesList: React.FC<CountriesListProps> = ({ 
  countries, 
  activeCountry, 
  onCountryClick 
}) => {
  const navigate = useNavigate();

  const handleCountryClick = (countryId: string) => {
    if (onCountryClick) {
      onCountryClick(countryId);
    } else {
      navigate(`/country/${countryId}`);
    }
  };

  return (
    <section className="px-0 mb-0 relative pb-16">
      <div className="container mx-auto px-2">
        {/* التبويبات في الأعلى (القنوات، الأفلام، المسلسلات، المباريات) */}
        <div className="flex mb-4 border-b border-gray-100/10 overflow-x-auto hide-scrollbar">
          <div className="flex-1 text-center py-3 px-2 text-white font-bold border-b-2 border-white">
            القنوات
          </div>
          <div className="flex-1 text-center py-3 px-2 text-white/70 font-medium">
            الأفلام
          </div>
          <div className="flex-1 text-center py-3 px-2 text-white/70 font-medium">
            المسلسلات
          </div>
          <div className="flex-1 text-center py-3 px-2 text-white/70 font-medium">
            المباريات
          </div>
        </div>
        
        {/* شبكة البلدان */}
        <div className="grid grid-cols-3 gap-4">
          {countries?.map(country => (
            <CountryCard 
              key={country.id} 
              country={country} 
              onClick={handleCountryClick}
              isActive={activeCountry === country.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesList;
