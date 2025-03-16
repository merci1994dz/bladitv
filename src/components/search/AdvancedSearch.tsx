
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCategories, getCountries } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSearchProps {
  initialQuery?: string;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  initialQuery = '', 
  className = '' 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // حالة البحث
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // فلاتر البحث
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  
  // تحميل الفئات والبلدان
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, countriesData] = await Promise.all([
          getCategories(),
          getCountries()
        ]);
        setCategories(categoriesData || []);
        setCountries(countriesData || []);
      } catch (error) {
        console.error('خطأ في تحميل بيانات الفلتر:', error);
        toast({
          title: "خطأ في التحميل",
          description: "تعذر تحميل خيارات الفلتر، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFilterData();
  }, [toast]);
  
  // وظيفة البحث
  const handleSearch = () => {
    if (!query.trim() && !selectedCategory && !selectedCountry) {
      toast({
        title: "البحث فارغ",
        description: "يرجى إدخال نص البحث أو اختيار فلتر",
      });
      return;
    }
    
    // بناء معلمات البحث
    const searchParams = new URLSearchParams();
    if (query.trim()) searchParams.set('q', query.trim());
    if (selectedCategory) searchParams.set('category', selectedCategory);
    if (selectedCountry) searchParams.set('country', selectedCountry);
    
    // التنقل إلى صفحة البحث مع المعلمات
    navigate(`/search?${searchParams.toString()}`);
  };
  
  // مسح الفلاتر
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCountry('');
    setQuery('');
  };
  
  // التقديم الشرطي للفلاتر
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <div className="pt-3 space-y-3 border-t mt-3">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground">الفئة</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الفئات</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-muted-foreground">البلد</label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="جميع البلدان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع البلدان</SelectItem>
              {countries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span>مسح الفلاتر</span>
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card className={`border border-primary/10 shadow-sm ${className}`}>
      <CardContent className="p-3">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن قناة..."
                className="pr-9 w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Button variant="default" size="sm" onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-1" />
              <span>بحث</span>
            </Button>
            
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              size="icon" 
              onClick={() => setShowFilters(!showFilters)}
              disabled={isLoading}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {renderFilters()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
