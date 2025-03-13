
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
    <section className="px-4 mb-10 relative">
      <div className="container mx-auto">
        {/* Decorative elements */}
        <div className="absolute -left-20 top-1/4 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 top-3/4 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Animated heading */}
        <div className="mb-6 text-center">
          <h2 className="inline-block text-2xl font-bold relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:mx-auto after:w-24 after:h-1 after:bg-primary after:rounded-full">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
              الدول المتاحة
            </span>
          </h2>
        </div>
        
        {/* Countries grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
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
