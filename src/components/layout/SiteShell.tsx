import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import BackgroundLayer from '@/components/layout/BackgroundLayer';
import Footer from '@/components/layout/Footer';
import Nav from '@/components/layout/Nav';
import SkipLink from '@/components/ui/SkipLink';

export interface SiteShellProps {
  children: ReactNode;
}

/**
 * 站点常驻骨架：Nav + 背景层 + main + Footer。
 *
 * 挂在 `<Routes>` 之外，所以切换路由时这两块（以及背景的 WebGL 上下文）都不会重建。
 * 图层顺序：背景 z-0 < 内容 z-10 < Nav z-40。
 */
export function SiteShell({ children }: SiteShellProps) {
  const { pathname } = useLocation();

  // 路由变化时回到页面顶部（只监听 pathname，页内 #anchor 不触发）
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <SkipLink />
      <Nav />
      <BackgroundLayer />
      <main id="content" className="relative z-10 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default SiteShell;
