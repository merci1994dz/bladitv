
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries } from '@/services/api';
import { AdminCountry } from '@/types';
import NewCountryForm from './countries/NewCountryForm';
import CountriesList from './countries/CountriesList';

const CountriesTab: React.FC = () => {
  // For editing
  const [editableCountries, setEditableCountries] = useState<AdminCountry[]>([]);
  
  // Queries
  const { 
    data: countries,
    isLoading: isLoadingCountries
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries
  });

  // Use useEffect to handle data changes
  useEffect(() => {
    if (countries) {
      setEditableCountries(countries.map(country => ({ ...country, isEditing: false })));
    }
  }, [countries]);
  
  const toggleEditCountry = (id: string) => {
    setEditableCountries(countries => countries.map(country => 
      country.id === id 
        ? { ...country, isEditing: !country.isEditing } 
        : country
    ));
  };
  
  const updateEditableCountry = (id: string, field: keyof AdminCountry, value: string) => {
    setEditableCountries(countries => countries.map(country => 
      country.id === id 
        ? { ...country, [field]: value } 
        : country
    ));
  };

  if (isLoadingCountries) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <NewCountryForm />
      
      <CountriesList 
        countries={editableCountries}
        onToggleEdit={toggleEditCountry}
        onUpdateField={updateEditableCountry}
      />
    </div>
  );
};

export default CountriesTab;
