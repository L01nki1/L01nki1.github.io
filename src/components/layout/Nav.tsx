import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { NAV_ITEMS, SITE } from '@/content/site';

/**
 * 顶部导航：滚动一屏内收缩 + 半透明毛玻璃，当前路由高亮。
 * 只改 padding / 背景 / 描边，不改高度层级，避免滚动时内容跳动。
 */
export function Nav() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string): boolean =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-40',
        'transition-[background-color,border-color,backdrop-filter] duration-[320ms] ease-brand',
        scrolled
          ? 'border-b border-line bg-bg/78 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <div
        className={[
          'hp-container flex items-center justify-between',
          'transition-[padding] duration-[320ms] ease-brand',
          scrolled ? 'py-2.5' : 'py-5',
        ].join(' ')}
      >
        <Link
          to="/"
          className="group font-display text-sm font-semibold tracking-tight text-text"
          aria-label={`${SITE.name} 首页`}
        >
          {SITE.name}
          <span className="ml-0.5 text-accent transition-opacity duration-[200ms] group-hover:opacity-70">
            .
          </span>
        </Link>

        <nav aria-label="主导航" className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase',
                  'transition-colors duration-[200ms] ease-brand',
                  active
                    ? 'text-accent'
                    : 'text-muted hover:text-text',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={SITE.links[0].href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub（在新标签打开）"
            className="ml-1 hidden rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors duration-[200ms] ease-brand hover:border-line-strong hover:text-accent sm:inline-flex"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Nav;
