
import React from 'react';
import { AdminCountry } from '@/types';
import CountryItem from './CountryItem';

interface CountriesListProps {
  countries: AdminCountry[];
  onToggleEdit: (id: string) => void;
  onUpdateField: (id: string, field: keyof AdminCountry, value: string) => void;
}

const CountriesList: React.FC<CountriesListProps> = ({ 
  countries, 
  onToggleEdit, 
  onUpdateField 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">قائمة البلدان ({countries.length})</h2>
      
      {countries.map(country => (
        <CountryItem
          key={country.id}
          country={country}
          onToggleEdit={onToggleEdit}
          onUpdateField={onUpdateField}
        />
      ))}
    </div>
  );
};

export default CountriesList;
