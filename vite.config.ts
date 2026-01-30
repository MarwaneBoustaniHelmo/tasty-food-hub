import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import { glob } from "glob";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Security: Prevent .env files from being copied to dist
    {
      name: 'exclude-env-files',
      async writeBundle() {
        const distPath = path.join(process.cwd(), 'dist');
        // Search for .env files at all levels in dist
        const patterns = [
          path.join(distPath, '.env*'),       // Root level
          path.join(distPath, '**/.env*'),    // All subdirectories
          path.join(distPath, '**/server/.env*'), // Server subdirectory
        ];
        
        for (const pattern of patterns) {
          const files = await glob(pattern, { dot: true, absolute: true });
          files.forEach(file => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
              console.log(`🔒 Security: Removed sensitive file: ${path.relative(process.cwd(), file)}`);
            }
          });
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Production optimizations
  build: {
    sourcemap: false, // Disable source maps in production for security
    target: 'es2015', // Support modern browsers for smaller bundles
    minify: 'terser', // Use terser for better compression
    // Explicitly exclude sensitive files from build output
    copyPublicDir: true,
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about .env files
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message.includes('.env')) return;
        warn(warning);
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          'query-vendor': ['@tanstack/react-query'],
          // Lazy load chatbot and heavy components
        },
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Asset inlining threshold (smaller assets are inlined as base64)
    assetsInlineLimit: 4096, // 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@anthropic-ai/sdk'], // Exclude server-only packages
  },
}));
