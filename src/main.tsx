import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

// Safari iOS viewport height fix - set --vh CSS variable
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => setTimeout(setViewportHeight, 100));

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading...</div>}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.Suspense>
  </React.StrictMode>
);
