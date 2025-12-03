import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Ha hibát kapsz a __dirname miatt, ezt a trükköt kell használni:
// import { fileURLToPath } from 'url';
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      // !!! 1. EZ A SOR NAGYON KELL AZ ELECTRON BUILDHEZ:
      base: './',

      server: {
        port: 3000, // !!! 2. A main.cjs-ben is http://localhost:3000 legyen!
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          // Ha a __dirname működik nálad, maradhat. 
          // Ha hibát dob, cseréld erre: path.resolve(process.cwd(), '.')
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});