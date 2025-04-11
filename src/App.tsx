
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { ThemeProvider } from 'next-themes';
import AutoSyncProvider from './components/AutoSyncProvider';
import AppRoutes from './AppRoutes';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 دقائق
      retry: 1,
    },
  },
});

function App() {
  // تسجيل أي أخطاء غير متوقعة
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Uncaught error:', error.error);
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AutoSyncProvider>
          <AppRoutes />
          <Toaster />
        </AutoSyncProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
