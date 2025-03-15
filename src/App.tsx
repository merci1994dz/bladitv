
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AppRoutes from './AppRoutes';
import './App.css';
import AutoSyncProvider from './components/AutoSyncProvider';
import { FirebaseProvider } from './services/firebase/FirebaseProvider';

// إنشاء عميل الاستعلام
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <FirebaseProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AutoSyncProvider>
            <AppRoutes />
            <Toaster />
          </AutoSyncProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </FirebaseProvider>
  );
}

export default App;
