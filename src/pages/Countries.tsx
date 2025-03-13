
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import CountryCard from '@/components/country/CountryCard';
import { Menu, Search, Tv, RefreshCw, Crown } from 'lucide-react';

const Countries: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('channels');

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

  const tabs = [
    { id: 'channels', name: 'القنوات' },
    { id: 'movies', name: 'الأفلام' },
    { id: 'series', name: 'المسلسلات' },
    { id: 'sports', name: 'المباريات' }
  ];

  if (isLoadingCountries) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#232323]">
        <LoadingSpinner />
      </div>
    );
  }

  if (countriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#232323]">
        <ErrorMessage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#232323]">
      {/* رأس الصفحة مع الشعار */}
      <header className="bg-[#232323] text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Menu className="w-6 h-6 mr-2" />
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-white p-1.5">
              <Tv className="w-5 h-5 text-[#232323]" />
            </div>
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold">General TV</h1>
        <div className="flex items-center space-x-4">
          <RefreshCw className="w-5 h-5" />
          <Search className="w-5 h-5" />
        </div>
      </header>
      
      {/* التبويبات في الأعلى */}
      <div className="flex border-b border-gray-100/10 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex-1 text-center py-3 px-2 ${activeTab === tab.id 
              ? 'text-white font-bold border-b-2 border-white' 
              : 'text-white/70 font-medium'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      {/* محتوى الصفحة */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {countries?.map(country => (
            <CountryCard 
              key={country.id} 
              country={country} 
              onClick={handleCountryClick} 
              isActive={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Countries;
