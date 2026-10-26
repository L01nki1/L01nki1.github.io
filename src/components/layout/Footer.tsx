import { Link } from 'react-router-dom';

import { NAV_ITEMS, SITE } from '@/content/site';

/** 页脚：mono 风格，站点状态 + 外链 + 版权。 */
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="hp-container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-sm font-semibold text-text">
            {SITE.name}
            <span className="text-accent">.</span>
          </p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed tracking-wide text-faint">
            内容全部以文件形式存放在仓库里 · 静态部署
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-6">
          <nav aria-label="页脚导航">
            <p className="hp-eyebrow">Sitemap</p>
            <ul className="mt-3 space-y-2">
              {NAV_ITEMS.map(item => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="font-mono text-[11px] tracking-wide text-muted transition-colors duration-[200ms] ease-brand hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="hp-eyebrow">Contact</p>
            <ul className="mt-3 space-y-2">
              {/* 空 href 视为「还没填」，直接不渲染 —— 避免链到一个没有内容的页面 */}
              {SITE.links.filter(link => link.href).map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    {...(link.href.startsWith('http')
                      ? {
                          target: '_blank',
                          rel: 'noopener noreferrer',
                          'aria-label': `${link.label}（在新标签打开）`,
                        }
                      : {})}
                    className="font-mono text-[11px] tracking-wide text-muted transition-colors duration-[200ms] ease-brand hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="hp-container flex flex-col gap-2 border-t border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
          {SITE.statusLine}
        </p>
        <p className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
          © {new Date().getFullYear()} {SITE.name} · Built with Vite + React
        </p>
      </div>
    </footer>
  );
}

export default Footer;
