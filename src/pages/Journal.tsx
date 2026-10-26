import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import AnimatedContent from '@/components/bits/AnimatedContent';
import LetterGlitch from '@/components/bits/LetterGlitch';
import MediaPlaceholder from '@/components/ui/MediaPlaceholder';
import { usePageMeta } from '@/lib/seo';
import { allTags, formatDate, getAllPosts } from '@/lib/journal';
import type { JournalPost } from '@/content/types';

/** 非首卡的基础跨列节奏（12 列栅格）。 */
const BASE_SPANS = [8, 4, 5, 7, 6, 6, 7, 5] as const;

/** 跨列数 → Tailwind 类。必须写成静态映射：模板字符串拼接不会被 Tailwind 扫描到。 */
const SPAN_CLASS: Record<number, string> = {
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

const OFFSETS = ['lg:translate-y-0', 'lg:translate-y-12', 'lg:translate-y-6', 'lg:translate-y-16'] as const;

/**
 * 计算每张非首卡的跨列数。
 *
 * 补洞规则：最后一张卡如果在本行只剩 ≤4 列，就把它拉满剩下的列。
 * 否则「只有 2 篇日记」时第 2 张卡跨 8 列、右边空 4 列，版面看起来像没做完。
 * 3 篇及以上时各卡自然填满行，规则不会触发，错落感保留。
 */
function computeSpans(count: number): number[] {
  const spans: number[] = Array.from(
    { length: count },
    (_, index) => BASE_SPANS[index % BASE_SPANS.length] ?? 6,
  );

  let usedInRow = 0;
  for (let index = 0; index < count; index += 1) {
    const span = spans[index] ?? 6;
    const remaining = 12 - usedInRow;
    const isLast = index === count - 1;
    if (isLast && remaining > span && remaining - span <= 4) {
      spans[index] = remaining;
      usedInRow = 0;
    } else {
      usedInRow = (usedInRow + span) % 12;
    }
  }

  return spans;
}

function spanClassOf(span: number): string {
  return SPAN_CLASS[span] ?? 'lg:col-span-6';
}

/** 通栏卡不加纵向偏移，否则会把它自己顶出网格节奏。 */
function offsetOf(index: number, span: number): string {
  if (span === 12) return 'lg:translate-y-0';
  return OFFSETS[index % OFFSETS.length] ?? 'lg:translate-y-0';
}

function TagPill({ tag }: { tag: string }) {
  return <span className="hp-pill">#{tag}</span>;
}

interface PostCardProps {
  post: JournalPost;
  index: number;
  featured?: boolean;
}

/** 列表卡：封面灰块（暂时无图）+ mono 日期 + 标题 + 标签。 */
function PostCard({ post, index, featured = false }: PostCardProps) {
  return (
    <Link
      to={`/journal/${post.slug}`}
      className={[
        'group flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-surface/80',
        'transition-[border-color,transform] duration-[320ms] ease-brand hover:-translate-y-0.5 hover:border-line-strong',
      ].join(' ')}
    >
      <MediaPlaceholder
        label={featured ? 'COVER / 16:10' : 'COVER'}
        alt={`《${post.title}》封面占位`}
        className={[
          'w-full border-b border-line',
          featured ? 'aspect-[16/10] max-h-[300px]' : 'aspect-[16/10] max-h-[180px]',
        ].join(' ')}
      />

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
            {post.date}
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
            {post.readingMin} MIN · {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h2
          className={[
            'mt-4 font-display font-semibold text-text',
            featured ? 'text-2xl md:text-3xl' : 'text-lg',
          ].join(' ')}
        >
          {post.title}
        </h2>

        <p
          className={[
            'mt-2.5 text-muted',
            featured ? 'max-w-[52ch] text-sm md:text-base' : 'text-[13px] leading-relaxed',
          ].join(' ')}
        >
          {post.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {post.tags.map(tag => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <p className="mt-auto pt-6 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
          {formatDate(post.date)} · 阅读 {post.readingMin} 分钟
          <span
            aria-hidden="true"
            className="ml-2 inline-block text-accent transition-transform duration-[200ms] ease-brand group-hover:translate-x-1"
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
}

/**
 * 日记列表页。
 *
 * - 顶部低透明度字母场，与首页保持连贯（本页是路由懒 chunk，图个视觉一致性）。
 * - 12 列错落网格：首卡通栏（最新一篇），其余跨 4/6/8 列不等，纵向偏移交替。
 * - 标签 pill 筛选：本地 state，不改 URL；筛选后整组重挂载以获得重排过渡。
 */
export function Journal() {
  const posts = getAllPosts();
  const tags = useMemo(() => allTags(posts), [posts]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  usePageMeta({
    title: '日记',
    description: `共 ${posts.length} 篇日记：技术笔记、城市观察，以及一些没结论的思考。`,
  });

  const filtered = activeTag === null ? posts : posts.filter(post => post.tags.includes(activeTag));
  const [featuredPost, ...restPosts] = filtered;
  const spans = useMemo(() => computeSpans(restPosts.length), [restPosts.length]);

  return (
    <div className="relative">
      {/* 顶部字母场（低透明度、装饰性） */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[46vh] z-0">
        <div className="h-full w-full opacity-40">
          <LetterGlitch density={0.32} baseOpacity={0.08} glitchAmount={0.05} dpr={1} intro={false} />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--color-bg) 88%)',
          }}
        />
      </div>

      <div className="hp-container relative z-10 pt-36 pb-24">
        <header className="max-w-2xl">
          <p className="hp-eyebrow">Journal</p>
          <h1 className="mt-3 font-display text-h2 font-semibold text-text">
            或许是一些想法
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            碎碎念以及人类观察日记，共 {posts.length} 篇。
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="mt-16 rounded-[16px] border border-dashed border-line-strong bg-white/[0.015] p-12 text-center">
            <p className="font-display text-lg text-text">还没有日记</p>
            <p className="mt-2 text-sm text-muted">第一篇正在写，先回首页看看项目。</p>
            <Link to="/" className="hp-btn hp-btn--ghost mt-6">
              返回首页
            </Link>
          </div>
        ) : (
          <>
            {/* 标签筛选条 */}
            <div className="mt-10 flex flex-wrap items-center gap-2" role="group" aria-label="按标签筛选">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                aria-pressed={activeTag === null}
                className={`hp-pill cursor-pointer ${activeTag === null ? 'hp-pill--active' : ''}`}
              >
                全部 <span className="ml-1 text-faint">{posts.length}</span>
              </button>
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(current => (current === tag ? null : tag))}
                  aria-pressed={activeTag === tag}
                  className={`hp-pill cursor-pointer ${activeTag === tag ? 'hp-pill--active' : ''}`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              /*
               * 这条分支当前不可达（pill 来自全部文章的标签池，点任何一个至少命中 1 篇）。
               * 保留是有意的：P2-02 要把筛选同步到 URL（`/journal?tag=xx`）后，
               * 外链带来的 tag 可能不在标签池里，这里就是那条防线路。
               * 不要删、也不要改语义。
               */
              <div className="mt-16 rounded-[16px] border border-dashed border-line-strong bg-white/[0.015] p-12 text-center">
                <p className="font-display text-lg text-text">该标签下暂无论文</p>
                <p className="mt-2 text-sm text-muted">换一个标签，或者看全部。</p>
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="hp-btn hp-btn--ghost mt-6 cursor-pointer"
                >
                  清除筛选
                </button>
              </div>
            ) : (
              <AnimatedContent
                key={activeTag ?? 'all'}
                trigger="mount"
                className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6"
                distance={28}
                duration={0.55}
                ease="power2.out"
                stagger={0.08}
                once
              >
                {featuredPost ? (
                  <div className="md:col-span-2 lg:col-span-12">
                    <PostCard post={featuredPost} index={0} featured />
                  </div>
                ) : null}

                {restPosts.map((post, index) => {
                  const span = spans[index] ?? 6;
                  return (
                    <div key={post.slug} className={`${spanClassOf(span)} ${offsetOf(index, span)}`}>
                      <PostCard post={post} index={index + 1} />
                    </div>
                  );
                })}
              </AnimatedContent>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Journal;
