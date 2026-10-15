import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages sirve la app en https://renem21.github.io/champions-league-app/
  base: '/champions-league-app/',
  plugins: [react(), tailwindcss()],
  build: {
    // Mismo directorio que usaba Create React App: lo esperan deploy.yml y `npm run deploy`
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'node',
    // scripts/*.test.js usan el test runner de Node (npm run test:scripts)
    include: ['src/**/*.test.js'],
  },
});
