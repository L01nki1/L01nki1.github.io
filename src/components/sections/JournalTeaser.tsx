import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';

import { useIsMobile } from '@/hooks/useMedia';
import { formatDate } from '@/lib/journal';
import type { JournalPost } from '@/content/types';

/** 懒边界：CardSwap 只在 ≥768px 且进入视口后才加载，移动端完全不下载。 */
const JournalCardStack = lazy(() =>
  import('@/components/sections/JournalCardStack').then(module => ({
    default: module.JournalCardStack,
  })),
);

export interface JournalTeaserProps {
  posts: readonly JournalPost[];
}

/**
 * ③ 屏：左文案 + 右叠卡（≥768px）/ 纵向列表（<768px）+ 「全部日记 →」CTA。
 *
 * 0 篇时优雅降级：只保留文案与 CTA，不渲染空卡组、不报错（P0-06）。
 */
export function JournalTeaser({ posts }: JournalTeaserProps) {
  const isMobile = useIsMobile();

  return (
    <section id="journal" className="sec-teaser hp-screen scroll-mt-24">
      <div className="hp-container">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
          <div>
            <p className="hp-eyebrow">03 — Journal</p>
            <h2 className="mt-3 font-display text-h2 font-semibold text-text">
              写下来才算想清楚
            </h2>
            <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-muted">
              技术笔记、城市观察，以及一些没结论的思考。日记是 Markdown 文件，
              加一篇就等于加一个 md 文件，不需要改任何组件。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/journal" className="hp-btn hp-btn--primary">
                全部日记
                <span aria-hidden="true">→</span>
              </Link>
              <span className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
                {posts.length > 0 ? `${posts.length} LATEST` : 'COMING SOON'}
              </span>
            </div>
          </div>

          <div className="min-h-[260px]">
            {posts.length === 0 ? (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-[16px] border border-dashed border-line-strong bg-white/[0.015] p-8 text-center">
                <p className="text-sm text-muted">
                  还没有日记。写完第一篇，它会自动出现在这里。
                </p>
              </div>
            ) : isMobile ? (
              <ul className="flex flex-col gap-3">
                {posts.map(post => (
                  <li key={post.slug}>
                    <Link
                      to={`/journal/${post.slug}`}
                      className="block rounded-[14px] border border-line bg-surface/80 p-5 transition-colors duration-[200ms] ease-brand hover:border-line-strong"
                    >
                      <span className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
                        {post.date}
                      </span>
                      <p className="mt-2 font-display text-base font-semibold text-text">
                        {post.title}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                        {post.summary}
                      </p>
                      <p className="mt-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
                        {post.tags.map(tag => `#${tag}`).join('  ')} · {formatDate(post.date)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Suspense
                fallback={
                  <div
                    className="h-[260px] w-full rounded-[16px] border border-line bg-surface/50"
                    aria-hidden="true"
                  />
                }
              >
                <JournalCardStack posts={posts} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default JournalTeaser;
