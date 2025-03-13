
import React from 'react';
import ProgramGuide from '@/components/guide/ProgramGuide';

interface CountryProgramGuideProps {
  show: boolean;
  channelId?: string | null;
}

const CountryProgramGuide: React.FC<CountryProgramGuideProps> = ({ 
  show, 
  channelId 
}) => {
  if (!show) return null;
  
  return (
    <div className="md:w-1/3 p-4">
      <ProgramGuide 
        channelId={channelId}
        onSelectProgram={() => {}} // يمكن إضافة وظيفة للتفاعل مع البرامج المحددة
      />
    </div>
  );
};

export default CountryProgramGuide;
