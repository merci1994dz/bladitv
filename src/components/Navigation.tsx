
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Globe, Search, Heart, Settings, Video, PieChart, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-tv';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isTV } = useDeviceType();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const navigationItems = [
    { 
      to: '/home', 
      icon: <Home strokeWidth={2} size={24} />, 
      label: 'الرئيسية', 
      active: location.pathname === '/home' || location.pathname === '/' 
    },
    { 
      to: '/countries', 
      icon: <Globe strokeWidth={2} size={24} />, 
      label: 'البلدان', 
      active: isActive('/countries') || isActive('/country/') 
    },
    { 
      to: '/categories', 
      icon: <PieChart strokeWidth={2} size={24} />, 
      label: 'الفئات', 
      active: isActive('/categories') 
    },
    { 
      to: '/search', 
      icon: <Search strokeWidth={2} size={24} />, 
      label: 'البحث', 
      active: isActive('/search') 
    },
    { 
      to: '/favorites', 
      icon: <Heart strokeWidth={2} size={24} />, 
      label: 'المفضلة', 
      active: isActive('/favorites') 
    },
    { 
      to: '/settings', 
      icon: <Settings strokeWidth={2} size={24} />, 
      label: 'الإعدادات', 
      active: isActive('/settings') 
    },
    { 
      to: '/admin', 
      icon: <Shield strokeWidth={2} size={24} />, 
      label: 'المشرف', 
      active: isActive('/admin') 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10">
      <div className="flex justify-around items-center">
        {navigationItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "py-4 flex flex-col items-center justify-center flex-1 transition-colors duration-200",
              item.active 
                ? "text-white font-medium" 
                : "text-white/60 hover:text-white/80",
              isTV && "tv-focus-item"
            )}
            tabIndex={isTV ? 0 : undefined}
          >
            <div className={cn(
              "text-current mb-1",
              item.active && "text-primary"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "text-xs",
              isTV && "text-sm"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
