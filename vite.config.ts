import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * 构建配置。
 * - `base` 读环境变量，GitHub Pages user pages 走根路径 `'/'`，将来换域名不用改代码。
 * - `@/*` 别名必须与 tsconfig 的 `paths` 保持同步。
 * - `motion/react` 单独切 chunk：BlurText 需要它，但内容页不需要。
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['motion/react'],
        },
      },
    },
  },
});
