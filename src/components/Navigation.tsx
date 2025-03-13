
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Tv, Globe, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 z-30">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center">
          <NavLink 
            to="/home" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`
            }
          >
            <Home size={24} />
            <span className="text-xs mt-1">الرئيسية</span>
          </NavLink>
          
          <NavLink 
            to="/categories" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`
            }
          >
            <Tv size={24} />
            <span className="text-xs mt-1">الفئات</span>
          </NavLink>
          
          <NavLink 
            to="/countries" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`
            }
          >
            <Globe size={24} />
            <span className="text-xs mt-1">البلدان</span>
          </NavLink>
          
          <NavLink 
            to="/search" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`
            }
          >
            <Search size={24} />
            <span className="text-xs mt-1">البحث</span>
          </NavLink>
          
          <NavLink 
            to="/favorites" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`
            }
          >
            <Heart size={24} />
            <span className="text-xs mt-1">المفضلة</span>
          </NavLink>

          <NavLink 
            to="/admin" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`
            }
          >
            <Settings size={24} />
            <span className="text-xs mt-1">الإدارة</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
