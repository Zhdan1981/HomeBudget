import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // FIX: Replaced `process.cwd()` with `'.'` to avoid a TypeScript type error (`Property 'cwd' does not exist on type 'Process'`). This change is functionally equivalent.
    const env = loadEnv(mode, '.', '');
    
    // Create definitions for Vite's `define` option to expose env variables to the app
    const envWithProcessPrefix = Object.entries(env).reduce(
      (prev, [key, val]) => {
        return {
          ...prev,
          // Use JSON.stringify to correctly handle all values, including complex strings
          // with special characters, which is crucial for platforms like Vercel.
          [`process.env.${key}`]: JSON.stringify(val),
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