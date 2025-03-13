
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Country } from '@/types';
import CountryCard from './CountryCard';
import { useDeviceType } from '@/hooks/use-tv';

interface CountriesListProps {
  countries: Country[];
  activeCountry: string | null;
  onCountryClick?: (countryId: string) => void;
}

const CountriesList: React.FC<CountriesListProps> = ({ 
  countries, 
  activeCountry, 
  onCountryClick 
}) => {
  const navigate = useNavigate();
  const { isTV } = useDeviceType();
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  const handleCountryClick = (countryId: string) => {
    if (onCountryClick) {
      onCountryClick(countryId);
    } else {
      navigate(`/country/${countryId}`);
    }
  };

  // إضافة دعم التنقل بلوحة المفاتيح لأجهزة التلفزيون
  useEffect(() => {
    if (!isTV || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // تحقق مما إذا كان التركيز داخل قائمة البلدان
      if (!containerRef.current?.contains(document.activeElement)) return;

      const grid = containerRef.current.querySelector('.grid');
      const items = Array.from(grid?.querySelectorAll('[data-country-card]') || []);
      const totalItems = items.length;
      
      // تحديد عدد الأعمدة حسب حجم الشاشة
      const columnsCount = window.innerWidth >= 1280 ? 6 : 
                           window.innerWidth >= 768 ? 4 : 
                           window.innerWidth >= 640 ? 3 : 2;
      
      switch (event.key) {
        case 'ArrowRight':
          if (focusedIndex < totalItems - 1) {
            setFocusedIndex(prev => prev + 1);
            (items[focusedIndex + 1] as HTMLElement)?.focus();
          }
          event.preventDefault();
          break;
        case 'ArrowLeft':
          if (focusedIndex > 0) {
            setFocusedIndex(prev => prev - 1);
            (items[focusedIndex - 1] as HTMLElement)?.focus();
          }
          event.preventDefault();
          break;
        case 'ArrowDown':
          if (focusedIndex + columnsCount < totalItems) {
            setFocusedIndex(prev => prev + columnsCount);
            (items[focusedIndex + columnsCount] as HTMLElement)?.focus();
          }
          event.preventDefault();
          break;
        case 'ArrowUp':
          if (focusedIndex - columnsCount >= 0) {
            setFocusedIndex(prev => prev - columnsCount);
            (items[focusedIndex - columnsCount] as HTMLElement)?.focus();
          }
          event.preventDefault();
          break;
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0 && focusedIndex < totalItems) {
            const countryId = items[focusedIndex].getAttribute('data-country-id');
            if (countryId) handleCountryClick(countryId);
          }
          event.preventDefault();
          break;
      }
    };

    // تعيين التركيز الأولي عند التحميل إذا كان جهاز تلفزيون
    if (countries.length > 0 && focusedIndex === -1) {
      setFocusedIndex(0);
      
      // تأخير قصير للتأكد من تحميل DOM
      setTimeout(() => {
        const firstItem = containerRef.current?.querySelector('[data-country-card]') as HTMLElement;
        if (firstItem) firstItem.focus();
      }, 500);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTV, countries, focusedIndex, handleCountryClick, navigate, onCountryClick]);

  return (
    <section className="px-4 mb-10 relative" ref={containerRef}>
      <div className="container mx-auto">
        {/* العناصر الزخرفية */}
        <div className="absolute -left-20 top-1/4 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 top-3/4 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* العنوان المتحرك */}
        <div className="mb-6 text-center">
          <h2 className={`inline-block text-2xl font-bold relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:mx-auto after:w-24 after:h-1 after:bg-primary after:rounded-full ${isTV ? 'tv-text text-3xl' : ''}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
              الدول المتاحة
            </span>
          </h2>
        </div>
        
        {/* شبكة الدول */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {countries?.map((country, index) => (
            <CountryCard 
              key={country.id} 
              country={country} 
              onClick={handleCountryClick}
              isActive={activeCountry === country.id}
              isTV={isTV}
              isFocused={index === focusedIndex && isTV}
              data-country-card
              data-country-id={country.id}
              tabIndex={isTV ? 0 : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesList;
