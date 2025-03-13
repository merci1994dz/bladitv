
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
    <section className="px-4 mb-10">
      <div className="container mx-auto">
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
