import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://jokrjjhbnfugfntbggud.supabase.co/functions/v1',
        changeOrigin: true,
        secure: false, // For local development stability
        rewrite: (path) => 
          path.replace(/^\/api\/resume\/generate\/stream/, '/resume-stream')
              .replace(/^\/api\/resume\/upload/, '/resume-upload')
              .replace(/^\/api\/jd\/extract/, '/jd-extract')
              .replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ensure Auth and apikey headers are preserved
            const authHeader = req.headers['authorization'];
            const apiKey = req.headers['apikey'];
            if (authHeader) proxyReq.setHeader('Authorization', authHeader);
            if (apiKey) proxyReq.setHeader('apikey', apiKey);
          });
        },
      },
    },
  },
})
