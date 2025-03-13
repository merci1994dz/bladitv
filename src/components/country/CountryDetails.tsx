
import React from 'react';
import { Country } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Globe, Flag, MapPin } from 'lucide-react';

interface CountryDetailsProps {
  country: Country;
  channelsCount: number;
  isTV?: boolean;
}

const CountryDetails: React.FC<CountryDetailsProps> = ({ 
  country, 
  channelsCount,
  isTV = false
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md">
          <span className="text-4xl">{country.flag}</span>
        </div>
        
        <div>
          <h2 className={`font-bold flex items-center gap-2 ${isTV ? 'text-2xl tv-text' : 'text-xl'}`}>
            <Flag className="h-4 w-4 text-primary" />
            <span>{country.name}</span>
          </h2>
          
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 mr-1" />
            <span>{channelsCount} قناة متاحة</span>
          </div>
        </div>
        
        <div className="mr-auto">
          <Badge variant="outline" className="bg-primary/5 gap-1">
            <MapPin className="h-3 w-3" />
            <span>متاح</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default CountryDetails;
