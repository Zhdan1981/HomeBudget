import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // fix: Replace __dirname with process.cwd() to resolve path in an ES module context.
          // FIX: The `process.cwd()` call was causing a TypeScript type error. `path.resolve('.')` is functionally equivalent and avoids this issue.
          '@': path.resolve('.'),
        }
      }
    };
});
