import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const framesRouteRewritePlugin = (): Plugin => ({
  name: 'frames-route-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && req.url.startsWith('/frames/')) {
        req.url = '/images' + req.url;
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), framesRouteRewritePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5300,
    strictPort: true,
    open: false,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 2000,
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '**/.gemini/**',
        '**/.agents/**',
        '**/backend/**',
        '**/*.pkl',
        '**/*.zip',
        '**/public/**',
      ],
    },
  },
});