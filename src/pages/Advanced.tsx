
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { channelService } from '@/services/api';
import { Channel } from '@/types';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import LoadingIndicator from '@/components/LoadingIndicator';
import ChannelsList from '@/components/channel/ChannelsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdvancedSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const country = searchParams.get('country') || '';
  
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [countryName, setCountryName] = useState<string>('');
  
  const {
    data: allChannels,
    isLoading,
    error
  } = useQuery({
    queryKey: ['channels'],
    queryFn: channelService.getChannels
  });
  
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => import('@/services/api').then(api => api.getCategories())
  });
  
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => import('@/services/api').then(api => api.getCountries())
  });
  
  // تحديث الأسماء عند تغيير البيانات
  useEffect(() => {
    if (categories && category) {
      const foundCategory = categories.find(c => c.id === category);
      setCategoryName(foundCategory?.name || '');
    }
    
    if (countries && country) {
      const foundCountry = countries.find(c => c.id === country);
      setCountryName(foundCountry?.name || '');
    }
  }, [categories, countries, category, country]);
  
  // تصفية القنوات عند تغيير المعايير
  useEffect(() => {
    if (!allChannels) return;
    
    let result = [...allChannels];
    
    if (query) {
      result = result.filter(channel => 
        channel.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (category) {
      result = result.filter(channel => channel.category === category);
    }
    
    if (country) {
      result = result.filter(channel => channel.country === country);
    }
    
    setFilteredChannels(result);
  }, [allChannels, query, category, country]);
  
  // إنشاء عنوان مناسب بناءً على معايير البحث
  const getTitle = () => {
    if (query && !category && !country) {
      return `نتائج البحث: "${query}"`;
    }
    
    if (!query && category && !country) {
      return `قنوات فئة: ${categoryName}`;
    }
    
    if (!query && !category && country) {
      return `قنوات بلد: ${countryName}`;
    }
    
    if (query || category || country) {
      return "نتائج البحث المتقدم";
    }
    
    return "البحث المتقدم";
  };
  
  // عرض الفلاتر النشطة
  const renderActiveFilters = () => {
    if (!query && !category && !country) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="text-muted-foreground flex items-center">
          <ListFilter className="h-4 w-4 mr-1" />
          <span>الفلاتر:</span>
        </div>
        
        {query && (
          <Badge variant="outline" className="bg-primary/5">
            بحث: {query}
          </Badge>
        )}
        
        {category && categoryName && (
          <Badge variant="outline" className="bg-primary/5">
            الفئة: {categoryName}
          </Badge>
        )}
        
        {country && countryName && (
          <Badge variant="outline" className="bg-primary/5">
            البلد: {countryName}
          </Badge>
        )}
      </div>
    );
  };
  
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-4">حدث خطأ</h1>
        <p>تعذر تحميل القنوات. يرجى المحاولة مرة أخرى لاحقًا.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{getTitle()}</h1>
        {renderActiveFilters()}
      </div>
      
      <AdvancedSearch initialQuery={query} className="mb-6" />
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" text="جاري تحميل القنوات..." />
        </div>
      ) : filteredChannels.length > 0 ? (
        <ChannelsList channels={filteredChannels} />
      ) : (
        <Card className="border-dashed border-muted">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Filter className="h-12 w-12 text-muted mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground text-center">
              لم يتم العثور على قنوات تطابق معايير البحث هذه.
              <br />
              حاول تعديل البحث أو الفلاتر المستخدمة.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearchPage;
