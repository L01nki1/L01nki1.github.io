import { Suspense, lazy, ViewTransition } from 'react';
import { Route, Routes } from 'react-router-dom';

import SiteShell from '@/components/layout/SiteShell';
import Home from '@/pages/Home';

/** 路由懒加载：日记页带有 gsap / marked / typography，不参与首屏。 */
const Journal = lazy(() => import('@/pages/Journal'));
const JournalPost = lazy(() => import('@/pages/JournalPost'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/** 骨架占位条的宽度（递减），让加载态有「内容感」而不是一块空白。 */
const SKELETON_BARS = ['w-[78%]', 'w-[68%]', 'w-[56%]', 'w-[44%]', 'w-[30%]'] as const;

/**
 * 路由切换 / 冷启动时的内容区骨架。
 *
 * 设计约束：
 * - **不整屏居中、不遮背景**：Nav / BackgroundLayer / Footer 常驻，兜底只占内容区，
 *   否则首帧会闪一块纯黑，比空白更难看（本组件就是来替掉那个整屏 "Loading" 的）。
 * - `min-h-[60vh]`：兜底高度接近真实内容高度，加载完成时不会把 Footer 顶上来又推下去（CLS）。
 * - 顶部 `pt-36` 与 Journal / JournalPost 的 `pt-36` 对齐，正好落在 fixed Nav 下方。
 * - 装饰性占位条 `aria-hidden`，真正的语义交给上面的 `sr-only` 文案。
 */
function RouteFallback() {
  return (
    <div className="hp-container pt-36 pb-24">
      <p className="sr-only">正在加载</p>

      <div aria-hidden="true" className="min-h-[60vh] motion-safe:animate-pulse">
        {/* 标题区：eyebrow + 标题 + 摘要 */}
        <div className="h-2.5 w-20 rounded-full bg-white/[0.05]" />
        <div className="mt-5 h-8 w-[54%] rounded-xl bg-white/[0.06]" />
        <div className="mt-4 h-3 w-[62%] rounded-full bg-white/[0.04]" />

        {/* 内容区：5 条递减占位条 */}
        <div className="mt-14 flex flex-col gap-4">
          {SKELETON_BARS.map(width => (
            <div key={width} className={`h-3 rounded-full bg-white/[0.04] ${width}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 路由表：`/`、`/journal`、`/journal/:slug`、`*`。
 * `SiteShell`（Nav + 背景层 + Footer）在 `<Routes>` 之外，切路由不重建。
 *
 * 转场：`<ViewTransition name="page">` 只包内容区，因此整页快照（root）不动、
 * 只有 `page` 这一层做斜切横扫。样式见 `styles/theme.css` 末尾。
 * 依赖 React Router 7 的 `BrowserRouter` 把导航包在 `startTransition` 里，
 * 否则 React 不会启动 view transition（实测确认已生效，见 docs/qa）。
 */
export function App() {
  return (
    <SiteShell>
      <Suspense fallback={<RouteFallback />}>
        <ViewTransition name="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<JournalPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ViewTransition>
      </Suspense>
    </SiteShell>
  );
}

export default App;
