import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import ReadingProgress from '@/components/ui/ReadingProgress';
import NotFound from '@/pages/NotFound';
import { formatDate, getAdjacent, getPost } from '@/lib/journal';
import { renderMarkdown } from '@/lib/markdown';
import { usePageMeta } from '@/lib/seo';
import '@/styles/prose.css';

/**
 * 日记详情页。
 *
 * - 首屏不复用 Canvas 背景，只留纯黑 + 极细网格，保证长文可读。
 * - 正文**同步**渲染（`renderMarkdown` 是同步函数）：首帧即全文，没有"先占位后插入"
 *   造成的 CLS（上一版异步 import marked 时实测 CLS 0.153）。
 *   `marked` 随本路由的懒 chunk 一起加载，不进 entry。
 * - 顶部 2px 进度条（scaleX，不动 layout）。
 * - 不存在 / draft:true → 渲染 404。
 */
export function JournalPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;
  const html = useMemo(() => (post ? renderMarkdown(post.body) : ''), [post]);

  usePageMeta({
    title: post ? post.title : '页面走丢了',
    description: post?.summary,
  });

  if (!post) {
    return <NotFound />;
  }

  const { prev, next } = getAdjacent(post.slug);

  return (
    <div className="relative">
      <ReadingProgress />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hp-grid-hair opacity-40"
      />

      <div className="hp-container relative z-10 pt-36 pb-24">
        <article>
          <header className="max-w-[68ch]">
            <p className="hp-eyebrow">Journal / {post.date}</p>
            <h1 className="mt-4 font-display text-h2 font-semibold text-text">{post.title}</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted">{post.summary}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="hp-pill">
                  #{tag}
                </span>
              ))}
              <span className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
                {formatDate(post.date)} · 阅读约 {post.readingMin} 分钟
              </span>
            </div>
          </header>

          <hr className="mt-10 max-w-[68ch] border-line" />

          <div
            className="hp-prose mt-10"
            // 内容来自仓库内的本地 Markdown 文件（构建时打包），非用户输入
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* 上下篇导航：首篇无「上一篇」、末篇无「下一篇」 */}
        <nav
          aria-label="日记导航"
          className="mt-20 grid max-w-[68ch] gap-4 border-t border-line pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              to={`/journal/${prev.slug}`}
              className="group rounded-[14px] border border-line bg-surface/70 p-5 transition-colors duration-[200ms] ease-brand hover:border-line-strong"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
                ← 上一篇（更新）
              </span>
              <p className="mt-2 font-display text-base font-semibold text-text group-hover:text-accent">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span aria-hidden="true" className="hidden sm:block" />
          )}

          {next ? (
            <Link
              to={`/journal/${next.slug}`}
              className="group rounded-[14px] border border-line bg-surface/70 p-5 text-right transition-colors duration-[200ms] ease-brand hover:border-line-strong"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
                下一篇（更旧）→
              </span>
              <p className="mt-2 font-display text-base font-semibold text-text group-hover:text-accent">
                {next.title}
              </p>
            </Link>
          ) : null}
        </nav>

        <div className="mt-12 max-w-[68ch]">
          <Link
            to="/journal"
            className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase transition-colors duration-[200ms] ease-brand hover:text-accent"
          >
            ← 全部日记
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JournalPost;
