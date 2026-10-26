import { Link } from 'react-router-dom';

import LetterGlitch from '@/components/bits/LetterGlitch';
import { usePageMeta } from '@/lib/seo';

/**
 * 404：复用字母场背景 + 一句话 + 回首页按钮。
 * 任何未知路径、以及 draft:true / 不存在的日记 slug 都会落到这里。
 */
export function NotFound() {
  usePageMeta({
    title: '页面走丢了',
    description: '你似乎跌入了无人的虚空。',
  });

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(at 80% 0%, #101826, transparent 60%), var(--color-bg)',
        }}
      >
        <div className="h-full w-full opacity-45">
          <LetterGlitch
            interactive={false}
            density={0.5}
            baseOpacity={0.1}
            glitchAmount={0.12}
            dpr={1}
            intro={false}
          />
        </div>
      </div>

      <div className="hp-container relative z-10 py-32">
        <p className="hp-eyebrow">Error 404</p>
        <h1 className="mt-4 font-display text-hero font-bold text-text">走丢了</h1>
        <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-muted">
          这个地址没有内容。检查链接是否正确。
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/" className="hp-btn hp-btn--primary">
            回到首页
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/journal" className="hp-btn hp-btn--ghost">
            看日记
          </Link>
        </div>

        <p className="mt-12 font-mono text-[10px] tracking-[0.24em] text-faint uppercase">
          404 · Not Found
        </p>
      </div>
    </div>
  );
}

export default NotFound;
