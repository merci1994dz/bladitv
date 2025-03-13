import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Flag, Grid3X3, Search, Settings, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          <NavItem 
            to="/home" 
            icon={<Home className="h-6 w-6" />} 
            label="الرئيسية" 
            isActive={isActive('/home')} 
          />
          <NavItem 
            to="/favorites" 
            icon={<Heart className="h-6 w-6" />} 
            label="المفضلة" 
            isActive={isActive('/favorites')} 
          />
          <NavItem 
            to="/countries" 
            icon={<Flag className="h-6 w-6" />} 
            label="البلدان" 
            isActive={isActive('/countries')} 
          />
          <NavItem 
            to="/categories" 
            icon={<Grid3X3 className="h-6 w-6" />} 
            label="الفئات" 
            isActive={isActive('/categories')} 
          />
          <NavItem 
            to="/search" 
            icon={<Search className="h-6 w-6" />} 
            label="البحث" 
            isActive={isActive('/search')} 
          />
          <NavItem 
            to="/admin" 
            icon={<Settings className="h-6 w-6" />} 
            label="الإدارة" 
            isActive={isActive('/admin') || isActive('/remote-config')} 
          />
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export default Navigation;
