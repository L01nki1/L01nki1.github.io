import { useLocation } from 'react-router-dom';

import LetterGlitch from '@/components/bits/LetterGlitch';

/**
 * 全站常驻背景层（LetterGlitch 实例 A）。
 *
 * 挂在 SiteShell 里、`<Routes>` 之外，所以路由切换不会重建 WebGL 上下文；
 * 切路由只改透明度（首页更亮、内容页更暗，保证长文可读）。
 *
 * 无 WebGL2 时 LetterGlitch 会渲染一张空 canvas（不是崩溃），
 * 因此这里必须垫一层 CSS 径向渐变 —— 否则首屏就是纯黑一片。
 */
export function BackgroundLayer() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(at 80% 0%, #101826, transparent 60%), var(--color-bg)',
      }}
    >
      <div
        className="h-full w-full transition-opacity duration-[520ms] ease-brand"
        style={{ opacity: isHome ? 1 : 0.42 }}
      >
        <LetterGlitch
          interactive={false}
          density={0.45}
          baseOpacity={0.1}
          glitchAmount={0.06}
          dpr={1}
          intro={false}
        />
      </div>
      {/* 底部压暗，保证 Footer 与正文边缘的对比度 */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: 'linear-gradient(to top, var(--color-bg), transparent)',
        }}
      />
    </div>
  );
}

export default BackgroundLayer;
