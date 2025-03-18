
import React from 'react';
import HomeSync from './HomeSync';
import HomeSearchButton from './HomeSearchButton';
import { Tv, TvIcon } from 'lucide-react';

interface HomeTitleSectionProps {
  refetchChannels: () => Promise<any>;
}

const HomeTitleSection: React.FC<HomeTitleSectionProps> = ({ refetchChannels }) => {
  return (
    <div className="bg-gradient-to-r from-primary/30 to-primary/5 p-6 rounded-xl flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-primary/30 p-3 rounded-full shadow-inner">
          <TvIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          جميع القنوات
        </h1>
      </div>
      <div className="flex gap-3">
        <HomeSync refetchChannels={refetchChannels} />
        <HomeSearchButton />
      </div>
    </div>
  );
};

export default HomeTitleSection;
