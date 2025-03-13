
import React from 'react';
import { History as HistoryIcon, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EmptyHistoryProps {
  searchQuery: string;
}

const EmptyHistory: React.FC<EmptyHistoryProps> = ({ searchQuery }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <HistoryIcon size={64} className="text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">لا توجد قنوات في سجل المشاهدة</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {searchQuery ? 
          'لا توجد نتائج تطابق بحثك. جرب كلمات بحث أخرى.' : 
          'عند مشاهدة القنوات، ستظهر هنا لسهولة الوصول إليها في وقت لاحق.'}
      </p>
      <Button onClick={() => window.location.href = '/home'}>
        <Play size={16} className="mr-2" />
        تصفح القنوات
      </Button>
    </div>
  );
};

export default EmptyHistory;
