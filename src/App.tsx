
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Countries from "./pages/Countries";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Navigation from "./components/Navigation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={
              <>
                <Home />
                <Navigation />
              </>
            } />
            <Route path="/categories" element={
              <>
                <Categories />
                <Navigation />
              </>
            } />
            <Route path="/countries" element={
              <>
                <Countries />
                <Navigation />
              </>
            } />
            <Route path="/search" element={
              <>
                <Search />
                <Navigation />
              </>
            } />
            <Route path="/favorites" element={
              <>
                <Favorites />
                <Navigation />
              </>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
