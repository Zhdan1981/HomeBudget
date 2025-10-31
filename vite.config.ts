import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Create definitions for Vite's `define` option to expose env variables to the app
    const envWithProcessPrefix = Object.entries(env).reduce(
      (prev, [key, val]) => {
        return {
          ...prev,
          [`process.env.${key}`]: `"${val}"`,
        }
      },
      {},
    )

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: envWithProcessPrefix,
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});