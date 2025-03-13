
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getRecentlyWatchedChannels } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import CountriesList from '@/components/country/CountriesList';
import RecentlyWatchedChannels from '@/components/recently-watched/RecentlyWatchedChannels';
import { Channel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Menu, Search, Tv, RefreshCw, Crown } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleChannelClick = (channel: Channel) => {
    toast({
      title: "فتح القناة",
      description: `جاري فتح قناة ${channel.name}`,
      duration: 2000,
    });
    
    if (channel.country) {
      navigate(`/country/${channel.country}`, { state: { selectedChannelId: channel.id } });
    }
  };

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
      
      <div className="bg-[#232323]">
        <CountriesList 
          countries={countries} 
          activeCountry={null} 
          onCountryClick={handleCountryClick} 
        />
      </div>
    </div>
  );
};

export default Home;
