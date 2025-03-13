
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ProgramGuide from '@/components/guide/ProgramGuide';
import { useDeviceType } from '@/hooks/use-tv';

interface CountryPageHeaderProps {
  countryName: string;
  selectedChannelId?: string | null;
  showProgramGuide: boolean;
  setShowProgramGuide: (show: boolean) => void;
}

const CountryPageHeader: React.FC<CountryPageHeaderProps> = ({
  countryName,
  selectedChannelId,
  showProgramGuide,
  setShowProgramGuide
}) => {
  const navigate = useNavigate();
  const { isTV } = useDeviceType();

  return (
    <header className="px-4 py-2 mb-2 flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/countries')}
          className="mr-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className={`text-xl font-bold ${isTV ? 'tv-text text-2xl' : ''}`}>
          {countryName || 'تحميل البلد...'}
        </h1>
      </div>

      {/* زر دليل البرامج */}
      {isTV ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowProgramGuide(!showProgramGuide)}
          className={`${isTV ? 'tv-focus-item px-4 py-2' : ''}`}
        >
          <Calendar className="h-4 w-4 mr-1" />
          <span>دليل البرامج</span>
        </Button>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>دليل البرامج</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            <ProgramGuide 
              channelId={selectedChannelId}
              onSelectProgram={() => {}} // يمكن إضافة وظيفة للتفاعل مع البرامج المحددة
            />
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
};

export default CountryPageHeader;
