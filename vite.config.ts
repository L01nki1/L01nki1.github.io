import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import { SITE } from './src/content/site';

/** 往 html 属性里塞值时转义，避免文案里的引号/& 把标签弄坏。 */
const attr = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

/**
 * 把 `SITE` 里的站点名与描述注入 `index.html`。
 *
 * 为什么需要：`index.html` 是静态文件，import 不到 TS 常量，于是站点名和描述
 * 天然会出现「html 里一份、site.ts 里一份」两份真相。爬虫读静态那份、浏览器
 * 跑完 JS 读 site.ts 那份，两边不一致就会出现「分享卡片和搜索摘要不是同一句话」。
 * 用占位符 + 构建期注入，把两份并成一份。
 *
 * `enforce: 'pre'` 保证在 Vite 自己替换 `%BASE_URL%` 之前执行。
 */
function injectSiteMeta(): Plugin {
  return {
    name: 'inject-site-meta',
    enforce: 'pre',
    transformIndexHtml(html: string) {
      return html
        .replaceAll('__SITE_NAME__', attr(SITE.name))
        .replaceAll('__SITE_DESCRIPTION__', attr(SITE.description));
    },
  };
}

/**
 * 构建配置。
 * - `base` 读环境变量，GitHub Pages user pages 走根路径 `'/'`，将来换域名不用改代码。
 * - `@/*` 别名必须与 tsconfig 的 `paths` 保持同步。
 * - `motion/react` 单独切 chunk：BlurText 需要它，但内容页不需要。
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [injectSiteMeta(), react(), tailwindcss()],
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
