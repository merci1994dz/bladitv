
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleAlert } from 'lucide-react';

interface CMSPlaceholderProps {
  title: string;
  description?: string;
}

const CMSPlaceholder: React.FC<CMSPlaceholderProps> = ({ 
  title, 
  description = 'هذه الميزة قيد التطوير حاليًا وستكون متاحة قريبًا'
}) => {
  return (
    <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
      <CardContent className="pt-6 pb-4 text-center">
        <CircleAlert className="h-10 w-10 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">{title}</h3>
        <p className="text-amber-700 dark:text-amber-400 mb-4">{description}</p>
        <Button variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400">
          تفاصيل أكثر
        </Button>
      </CardContent>
    </Card>
  );
};

export default CMSPlaceholder;
