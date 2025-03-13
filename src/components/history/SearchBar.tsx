
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="ابحث في سجل المشاهدة..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-4"
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
