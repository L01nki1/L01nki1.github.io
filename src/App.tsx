import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import SiteShell from '@/components/layout/SiteShell';
import Home from '@/pages/Home';

/** 路由懒加载：日记页带有 gsap / marked / typography，不参与首屏。 */
const Journal = lazy(() => import('@/pages/Journal'));
const JournalPost = lazy(() => import('@/pages/JournalPost'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/** 路由切换时的兜底占位：保持背景与 Nav 不动，只让内容区短暂空白。 */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-[10px] tracking-[0.28em] text-faint uppercase">Loading</p>
    </div>
  );
}

/**
 * 路由表：`/`、`/journal`、`/journal/:slug`、`*`。
 * `SiteShell`（Nav + 背景层 + Footer）在 `<Routes>` 之外，切路由不重建。
 */
export function App() {
  return (
    <SiteShell>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<JournalPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SiteShell>
  );
}

export default App;
