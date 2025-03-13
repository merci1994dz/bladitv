
import React from 'react';
import { Clock } from 'lucide-react';

const HistoryHeader: React.FC = () => {
  return (
    <header className="pt-10 pb-6">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <Clock className="inline-block mr-2" />
        سجل المشاهدة
      </h1>
      <p className="text-muted-foreground">
        اعرض القنوات التي شاهدتها مؤخراً
      </p>
    </header>
  );
};

export default HistoryHeader;
