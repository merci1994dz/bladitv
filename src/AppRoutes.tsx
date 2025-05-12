
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import Advanced from './pages/Advanced';
import Navigation from './components/Navigation';

// تعريف المسارات
const routes = {
  splash: '/splash',
  index: '/',
  home: '/home',
  favorites: '/favorites',
  countries: '/countries',
  country: '/country/:countryId',
  categories: '/categories',
  search: '/search',
  advanced: '/advanced',
  admin: '/admin',
  settings: '/settings',
  remoteConfig: '/remote-config',
  backup: '/backup',
};

// مكون إعادة التوجيه
const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // إذا كان على المسار الجذر، قم بإعادة التوجيه إلى شاشة البداية
    if (location.pathname === '/') {
      navigate('/splash', { replace: true });
    }
  }, [location, navigate]);
  
  return null;
};

// مكون التطبيق الرئيسي
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* توجيه المسار الأساسي إلى شاشة البداية */}
      <Route path={routes.index} element={<Navigate to={routes.splash} replace />} />
      <Route path={routes.splash} element={<SplashScreen />} />
      
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
      
      {/* إذا لم يتم العثور على المسار، عرض صفحة 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
