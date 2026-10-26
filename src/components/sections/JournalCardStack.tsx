import { useNavigate } from 'react-router-dom';

import CardSwap, { Card } from '@/components/bits/CardSwap';
import type { JournalPost } from '@/content/types';

export interface JournalCardStackProps {
  posts: readonly JournalPost[];
}

/**
 * ③ 屏的叠卡组（独立模块 = 独立懒 chunk）。
 *
 * CardSwap 只依赖 react（自研 rAF 引擎，不含 gsap），但仍有 rAF 循环与透视计算，
 * 所以只在 ≥768px 时按需加载；移动端走 JournalTeaser 里的纵向列表。
 *
 * 点击卡片 → 打开对应日记；`index` 是原始子节点下标（CardSwap 内部会把该卡换到最前）。
 */
export function JournalCardStack({ posts }: JournalCardStackProps) {
  const navigate = useNavigate();

  return (
    <CardSwap
      width={420}
      height={250}
      cardDistance={48}
      verticalDistance={56}
      delay={5200}
      pauseOnHover
      visibleCards={3}
      cardRadius={16}
      theme="dark"
      onCardClick={index => {
        const post = posts[index];
        if (post) navigate(`/journal/${post.slug}`);
      }}
      className="mx-auto max-w-[520px]"
    >
      {posts.map(post => (
        <Card key={post.slug} customClass="hp-journal-card">
          <div className="flex h-full w-full flex-col justify-between p-6 text-left">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
                {post.date}
              </span>
              <span className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
                {post.readingMin} MIN
              </span>
            </div>

            <p className="mt-4 font-display text-xl leading-snug font-semibold text-text">
              {post.title}
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </CardSwap>
  );
}

export default JournalCardStack;
