import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EnhancedChatBot } from "./components/EnhancedChatBot";
import MobileStickyOrder from "@/components/MobileStickyOrder";
import ScrollToTop from "@/components/ScrollToTop";
import SkipToContent from "@/components/SkipToContent";
import Home from "@/pages/Home";
import Restaurants from "@/pages/Restaurants";
import Order from "@/pages/Order";
import Menu from "@/pages/Menu";
import Concept from "@/pages/Concept";
import Videos from "@/pages/Videos";
import Contact from "@/pages/Contact";
import Support from "@/pages/Support";
import NotFound from "@/pages/NotFound";
import TestDatabase from "@/pages/TestDatabase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Skip to content link for keyboard accessibility */}
        <SkipToContent />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main id="main-content" className="flex-1 pb-20 md:pb-0" role="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/commander" element={<Order />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/concept" element={<Concept />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/support" element={<Support />} />
              <Route path="/test-db" element={<TestDatabase />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          {/* Mobile-only sticky order button */}
          <MobileStickyOrder />
          {/* Scroll to top button */}
          <ScrollToTop />
        </div>
      </BrowserRouter>
      <EnhancedChatBot />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
