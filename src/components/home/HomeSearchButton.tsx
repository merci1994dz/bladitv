
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const HomeSearchButton: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenSearch = () => {
    // تضمين معلمة للإشارة إلى أن هذا انتقال صحيح وليس خطأً
    // Include a parameter to indicate this is a valid transition, not an error
    navigate('/advanced', { 
      state: { from: 'home' },
      replace: false
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenSearch}
      className="flex items-center gap-2 bg-background/90 hover:bg-background transition-all shadow-md hover:shadow-lg hover:scale-105 duration-200 rounded-lg border-primary/20"
    >
      <Search className="h-4 w-4 text-primary" />
      <span className="font-medium">بحث متقدم</span>
    </Button>
  );
};

export default HomeSearchButton;
