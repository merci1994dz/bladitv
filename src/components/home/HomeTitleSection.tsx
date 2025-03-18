
import React from 'react';
import HomeSync from './HomeSync';
import HomeSearchButton from './HomeSearchButton';
import { Tv } from 'lucide-react';

interface HomeTitleSectionProps {
  refetchChannels: () => Promise<any>;
}

const HomeTitleSection: React.FC<HomeTitleSectionProps> = ({ refetchChannels }) => {
  return (
    <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 rounded-t-xl flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-primary/20 p-2 rounded-full">
          <Tv className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          جميع القنوات
        </h1>
      </div>
      <div className="flex gap-2">
        <HomeSync refetchChannels={refetchChannels} />
        <HomeSearchButton />
      </div>
    </div>
  );
};

export default HomeTitleSection;
