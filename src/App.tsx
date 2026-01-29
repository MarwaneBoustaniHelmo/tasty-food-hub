import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileStickyOrder from "@/components/MobileStickyOrder";
import ScrollToTop from "@/components/ScrollToTop";
import SkipToContent from "@/components/SkipToContent";
import Home from "@/pages/Home";

// Lazy load non-critical pages for better initial load performance
const Restaurants = lazy(() => import("@/pages/Restaurants"));
const Order = lazy(() => import("@/pages/Order"));
const Menu = lazy(() => import("@/pages/Menu"));
const Concept = lazy(() => import("@/pages/Concept"));
const Videos = lazy(() => import("@/pages/Videos"));
const Contact = lazy(() => import("@/pages/Contact"));
const Reservation = lazy(() => import("@/pages/Reservation"));
const Support = lazy(() => import("@/pages/Support"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const TestDatabase = lazy(() => import("@/pages/TestDatabase"));
const StreamingDemo = lazy(() => import("@/pages/StreamingDemo"));

// Enhanced loading fallback with shimmer effect
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="space-y-6 w-full max-w-lg px-5">
      {/* Shimmer title */}
      <div className="h-10 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded-xl w-4/5 mx-auto animate-pulse"></div>
      {/* Shimmer lines */}
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded-lg w-full animate-pulse"></div>
        <div className="h-4 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded-lg w-5/6 mx-auto animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-4 bg-gradient-to-r from-secondary via-secondary/50 to-secondary rounded-lg w-4/5 mx-auto animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
      {/* Loading indicator */}
      <div className="flex justify-center pt-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce mx-2" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

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
          <main id="main-content" className="flex-1 pt-[88px] md:pt-[106px] pb-20 md:pb-0" role="main">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/commander" element={<Order />} />
                {/* /menu route (Comparateur) - Not linked in navbar but accessible via direct URL */}
                <Route path="/menu" element={<Menu />} />
                <Route path="/concept" element={<Concept />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/support" element={<Support />} />
                <Route path="/test-db" element={<TestDatabase />} />
                <Route path="/streaming-demo" element={<StreamingDemo />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          {/* Mobile-only sticky order button */}
          <MobileStickyOrder />
          {/* Scroll to top button */}
          <ScrollToTop />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
