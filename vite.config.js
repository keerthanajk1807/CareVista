import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = mode === 'github' ? (env.VITE_BASE_PATH || '/') : '/';
  const proxy = {'/api': 'http://localhost:5000'};
  return {
    base,
    plugins: [react(), VitePWA({
      registerType: 'prompt', injectRegister: false,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'CareVista Hospital', short_name: 'CareVista',
        start_url: base, scope: base, display: 'standalone',
        theme_color: '#ffffff', background_color: '#ffffff',
        icons: [
          {src:'android-chrome-192x192.png',sizes:'192x192',type:'image/png'},
          {src:'android-chrome-512x512.png',sizes:'512x512',type:'image/png'}
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        runtimeCaching: []
      }
    })],
    server: {proxy}, preview: {proxy}
  };
});
