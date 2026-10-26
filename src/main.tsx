import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from '@/App';
import soraDisplayFont from '@fontsource/sora/files/sora-latin-600-normal.woff2?url';
import '@/styles/theme.css';

/**
 * 预加载 1 个 Display 权重（Sora 600）。
 *
 * 走 `?url` 导入而不是写死路径：拿到的正是 fontsource CSS 里引用的那个带 hash 的资源，
 * 因此不会产生第二次下载，也不会因为 base 变化而 404。
 */
function preloadDisplayFont(): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  link.href = soraDisplayFont;
  document.head.appendChild(link);
}

preloadDisplayFont();

const container = document.getElementById('root');
if (!container) {
  throw new Error('[boot] #root 容器缺失，无法挂载应用');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
