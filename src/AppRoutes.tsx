
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Countries from './pages/Countries';
import CountryChannels from './pages/CountryChannels';
import Categories from './pages/Categories';
import Search from './pages/Search';
import Admin from './pages/Admin';
import RemoteConfig from './pages/RemoteConfig';
import NotFound from './pages/NotFound';
import SplashScreen from './pages/SplashScreen';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/home" element={<Home />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/countries" element={<Countries />} />
      <Route path="/country/:countryId" element={<CountryChannels />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/search" element={<Search />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/remote-config" element={<RemoteConfig />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
