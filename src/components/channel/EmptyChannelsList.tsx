
import React from 'react';
import { Globe, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyChannelsListProps {
  countryName: string;
  countryFlag: string;
  onSelectAnotherCountry?: () => void;
}

const EmptyChannelsList: React.FC<EmptyChannelsListProps> = ({
  countryName,
  countryFlag,
  onSelectAnotherCountry
}) => {
  return (
    <div className="col-span-full py-10 text-center">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Tv className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <p className="text-gray-500 mb-2 font-medium">لا توجد قنوات من {countryName} {countryFlag}</p>
        <p className="text-sm text-gray-400 mb-4">سيتم إضافة قنوات جديدة قريبًا، يمكنك تصفح قنوات من بلدان أخرى</p>
        
        {onSelectAnotherCountry && (
          <Button 
            variant="outline" 
            onClick={onSelectAnotherCountry}
            className="mt-2 flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            <span>اختر بلداً آخر</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyChannelsList;
