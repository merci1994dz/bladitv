
import React from 'react';
import HomeSync from './HomeSync';
import HomeSearchButton from './HomeSearchButton';

interface HomeTitleSectionProps {
  refetchChannels: () => Promise<any>;
}

const HomeTitleSection: React.FC<HomeTitleSectionProps> = ({ refetchChannels }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">جميع القنوات</h1>
      <div className="flex gap-2">
        <HomeSync refetchChannels={refetchChannels} />
        <HomeSearchButton />
      </div>
    </div>
  );
};

export default HomeTitleSection;
