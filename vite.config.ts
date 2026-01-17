import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import csp from "vite-plugin-csp-guard";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // CSP Plugin for security headers
    csp({
      dev: { 
        run: true
      },
      policy: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for dev HMR
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:", "https:", "blob:"],
        "connect-src": ["'self'", "https:", "wss:"], // wss for HMR in dev
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"], // Prevents clickjacking
        "upgrade-insecure-requests": [],
      },
      build: { 
        sri: true // Subresource Integrity for production builds
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Production optimizations
  build: {
    sourcemap: false, // Disable source maps in production for security
    rollupOptions: {
      output: {
        // Sanitize chunk names
        sanitizeFileName: (name) => name.replace(/[^\w.-]/g, '_'),
      },
    },
  },
}));
