
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getRecentlyWatchedChannels } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import HomeHeader from '@/components/header/HomeHeader';
import CountriesList from '@/components/country/CountriesList';
import RecentlyWatchedChannels from '@/components/recently-watched/RecentlyWatchedChannels';
import { Channel } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
    // هنا يمكن إضافة منطق لمعالجة النقر على القناة
    // إما تشغيلها مباشرة أو الانتقال إلى صفحة القناة
    toast({
      title: "فتح القناة",
      description: `جاري فتح قناة ${channel.name}`,
      duration: 2000,
    });
    
    // يمكننا الانتقال إلى صفحة البلد التي تنتمي إليها القناة
    if (channel.country) {
      navigate(`/country/${channel.country}`, { state: { selectedChannelId: channel.id } });
    }
  };

  if (isLoadingCountries) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (countriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage />
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-gradient-to-b from-background to-muted/10">
      <HomeHeader />
      
      {/* إضافة قسم القنوات المشاهدة مؤخراً */}
      <RecentlyWatchedChannels onChannelClick={handleChannelClick} />

      <CountriesList 
        countries={countries} 
        activeCountry={null} 
        onCountryClick={handleCountryClick} 
      />
    </div>
  );
};

export default Home;
