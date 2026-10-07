import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['desktop-pvhde4l.taildf270f.ts.net', 'desktop-pvhde4l'],
  },
});
