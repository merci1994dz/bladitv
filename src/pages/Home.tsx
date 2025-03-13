
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import HomeHeader from '@/components/header/HomeHeader';
import CountriesList from '@/components/country/CountriesList';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const { 
    data: countries,
    isLoading: isLoadingCountries,
    error: countriesError
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  const handleCountryClick = (countryId: string) => {
    navigate(`/country/${countryId}`);
  };

  if (isLoadingCountries) {
    return <LoadingSpinner />;
  }

  if (countriesError) {
    return <ErrorMessage />;
  }

  return (
    <div className="pb-24 min-h-screen bg-gradient-to-b from-background to-muted/10">
      <HomeHeader />

      <CountriesList 
        countries={countries} 
        activeCountry={null} 
        onCountryClick={handleCountryClick} 
      />
    </div>
  );
};

export default Home;
