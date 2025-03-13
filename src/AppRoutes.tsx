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
import BackupPage from './pages/Backup';

const routes = {
  home: '/',
  favorites: '/favorites',
  countries: '/countries',
  country: '/country/:countryId',
  categories: '/categories',
  search: '/search',
  admin: '/admin',
  remoteConfig: '/remote-config',
  backup: '/backup',
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={routes.home} element={<SplashScreen />} />
      <Route path={routes.favorites} element={<Favorites />} />
      <Route path={routes.countries} element={<Countries />} />
      <Route path={routes.country} element={<CountryChannels />} />
      <Route path={routes.categories} element={<Categories />} />
      <Route path={routes.search} element={<Search />} />
      <Route path={routes.admin} element={<Admin />} />
      <Route path={routes.remoteConfig} element={<RemoteConfig />} />
      <Route path={routes.backup} element={<BackupPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
