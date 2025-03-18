
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const HomeSearchButton: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenSearch = () => {
    navigate('/advanced');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenSearch}
      className="flex items-center gap-1 bg-background/80 hover:bg-background transition-all shadow-sm hover:shadow"
    >
      <Search className="h-4 w-4" />
      <span>بحث متقدم</span>
    </Button>
  );
};

export default HomeSearchButton;
