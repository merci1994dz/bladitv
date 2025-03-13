
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Channel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Tv2 } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-tv';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';

// نوع البرنامج
interface Program {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: string;
  isLive: boolean;
}

// واجهة بيانات دليل البرامج
interface ProgramGuideProps {
  channelId?: string;
  onSelectProgram?: (program: Program) => void;
}

const ProgramGuide: React.FC<ProgramGuideProps> = ({ channelId, onSelectProgram }) => {
  const { isTV } = useDeviceType();
  const [selectedDay, setSelectedDay] = useState<string>('today');
  
  // أيام الأسبوع (يمكن توسيعها لأسبوع كامل)
  const days = [
    { id: 'today', label: 'اليوم' },
    { id: 'tomorrow', label: 'غدًا' },
    { id: 'day-after', label: 'بعد غد' }
  ];

  // استعلام وهمي لجلب بيانات البرامج (يمكن استبداله بـAPI حقيقي)
  const { data: programs, isLoading } = useQuery({
    queryKey: ['programs', channelId, selectedDay],
    queryFn: async () => {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // بيانات تجريبية للعرض
      return [
        {
          id: '1',
          title: 'نشرة الأخبار',
          description: 'آخر الأخبار المحلية والعالمية',
          startTime: '08:00',
          endTime: '09:00',
          category: 'أخبار',
          isLive: selectedDay === 'today' && new Date().getHours() >= 8 && new Date().getHours() < 9
        },
        {
          id: '2',
          title: 'برنامج صباحي',
          description: 'منوعات وحوارات صباحية',
          startTime: '09:00',
          endTime: '11:00',
          category: 'منوعات',
          isLive: selectedDay === 'today' && new Date().getHours() >= 9 && new Date().getHours() < 11
        },
        {
          id: '3',
          title: 'وثائقي',
          description: 'فيلم وثائقي عن الطبيعة',
          startTime: '11:00',
          endTime: '12:00',
          category: 'وثائقي',
          isLive: selectedDay === 'today' && new Date().getHours() >= 11 && new Date().getHours() < 12
        },
        {
          id: '4',
          title: 'أفلام ومسلسلات',
          description: 'عرض أفلام ومسلسلات متنوعة',
          startTime: '12:00',
          endTime: '15:00',
          category: 'ترفيه',
          isLive: selectedDay === 'today' && new Date().getHours() >= 12 && new Date().getHours() < 15
        },
        {
          id: '5',
          title: 'برامج رياضية',
          description: 'أخبار وتحليلات رياضية',
          startTime: '15:00',
          endTime: '17:00',
          category: 'رياضة',
          isLive: selectedDay === 'today' && new Date().getHours() >= 15 && new Date().getHours() < 17
        },
        {
          id: '6',
          title: 'برامج للأطفال',
          description: 'رسوم متحركة وبرامج تعليمية',
          startTime: '17:00',
          endTime: '19:00',
          category: 'أطفال',
          isLive: selectedDay === 'today' && new Date().getHours() >= 17 && new Date().getHours() < 19
        },
        {
          id: '7',
          title: 'نشرة الأخبار المسائية',
          description: 'ملخص لأحداث اليوم',
          startTime: '19:00',
          endTime: '20:00',
          category: 'أخبار',
          isLive: selectedDay === 'today' && new Date().getHours() >= 19 && new Date().getHours() < 20
        }
      ];
    }
  });

  const handleProgramClick = (program: Program) => {
    if (onSelectProgram) {
      onSelectProgram(program);
    }
  };

  return (
    <div className={`w-full rounded-lg ${isTV ? 'tv-component' : ''}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isTV ? 'tv-text text-xl' : ''}`}>
        <Calendar className="inline-block w-5 h-5 mr-2 text-primary" />
        دليل البرامج
      </h3>
      
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className={`w-full mb-4 ${isTV ? 'p-2' : ''}`}>
          {days.map(day => (
            <TabsTrigger 
              key={day.id} 
              value={day.id}
              className={isTV ? 'tv-focus-item text-lg py-3' : ''}
            >
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {days.map(day => (
          <TabsContent key={day.id} value={day.id} className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-2">
                {programs && programs.map((program) => (
                  <Card 
                    key={program.id} 
                    className={`bg-card/50 transition-all hover:bg-card/80 ${
                      program.isLive ? 'border-primary border-2' : ''
                    } ${isTV ? 'tv-focus-item' : ''}`}
                    onClick={() => handleProgramClick(program)}
                  >
                    <CardContent className="p-3 flex items-center">
                      <div className="flex flex-col flex-grow">
                        <div className="flex items-center">
                          <h4 className={`font-medium ${isTV ? 'text-lg' : ''}`}>{program.title}</h4>
                          {program.isLive && (
                            <Badge variant="destructive" className="mr-2 animate-pulse">
                              <span className="w-2 h-2 bg-white rounded-full inline-block mr-1"></span>
                              مباشر
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{program.description}</p>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between h-full text-sm">
                        <Badge variant="outline" className="mb-2">
                          {program.category}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{program.startTime} - {program.endTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProgramGuide;
