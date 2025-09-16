import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const buildTimestamp = new Date().toISOString();
    const appVersion = '2.1.0';
    
    return {
      plugins: [
        react(),
        createHtmlPlugin({
          inject: {
            data: {
              BUILD_TIMESTAMP: buildTimestamp,
              APP_VERSION: appVersion,
            },
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        '__APP_VERSION__': JSON.stringify(appVersion),
        '__BUILD_TIMESTAMP__': JSON.stringify(buildTimestamp),
      },
      build: {
        rollupOptions: {
          output: {
            // Add hash to filenames for cache busting
            entryFileNames: `assets/[name]-[hash].js`,
            chunkFileNames: `assets/[name]-[hash].js`,
            assetFileNames: `assets/[name]-[hash].[ext]`
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        // Add headers to prevent caching during development
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        hmr: {
          clientPort: 5173,
        },
      }
    };
});
