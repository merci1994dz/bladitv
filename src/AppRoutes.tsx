
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
import UserSettings from './pages/UserSettings';
import Advanced from './pages/Advanced'; // صفحة البحث المتقدم الجديدة
import Navigation from './components/Navigation';
import Index from './pages/Index';

// تعريف المسارات مع تعديل مسار الصفحة الرئيسية
const routes = {
  splash: '/splash',
  index: '/',
  home: '/home',
  favorites: '/favorites',
  countries: '/countries',
  country: '/country/:countryId',
  categories: '/categories',
  search: '/search',
  advanced: '/advanced', // مسار البحث المتقدم الجديد
  admin: '/admin',
  settings: '/settings',
  remoteConfig: '/remote-config',
  backup: '/backup',
};

// تعريف الصفحات التي تحتاج إلى شريط التنقل
const pagesWithNavigation = [
  routes.home,
  routes.favorites,
  routes.countries,
  routes.country,
  routes.categories,
  routes.search,
  routes.advanced,
  routes.settings,
  routes.admin,
];

// مكون التطبيق الرئيسي
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={routes.splash} element={<SplashScreen />} />
      <Route path={routes.index} element={<Index />} />
      
      {/* الصفحات مع شريط التنقل */}
      <Route path={routes.home} element={
        <>
          <Home />
          <Navigation />
        </>
      } />
      <Route path={routes.favorites} element={
        <>
          <Favorites />
          <Navigation />
        </>
      } />
      <Route path={routes.countries} element={
        <>
          <Countries />
          <Navigation />
        </>
      } />
      <Route path={routes.country} element={
        <>
          <CountryChannels />
          <Navigation />
        </>
      } />
      <Route path={routes.categories} element={
        <>
          <Categories />
          <Navigation />
        </>
      } />
      <Route path={routes.search} element={
        <>
          <Search />
          <Navigation />
        </>
      } />
      <Route path={routes.advanced} element={
        <>
          <Advanced />
          <Navigation />
        </>
      } />
      <Route path={routes.settings} element={
        <>
          <UserSettings />
          <Navigation />
        </>
      } />
      <Route path={routes.admin} element={
        <>
          <Admin />
          <Navigation />
        </>
      } />
      
      {/* الصفحات بدون شريط التنقل */}
      <Route path={routes.remoteConfig} element={<RemoteConfig />} />
      <Route path={routes.backup} element={<BackupPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
