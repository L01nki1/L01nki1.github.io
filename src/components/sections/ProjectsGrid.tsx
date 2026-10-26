import AnimatedContent from '@/components/bits/AnimatedContent';
import ProjectCard from '@/components/sections/ProjectCard';
import { MORE_PROJECTS } from '@/content/site';
import type { Project } from '@/content/types';

export interface ProjectsGridProps {
  projects: readonly Project[];
}

/** Bento 网格里每一格的跨列规则：featured 占 2×2 大格，CTA 占通栏。 */
function cellClass(index: number, total: number, featured: boolean): string {
  const isLast = index === total - 1;
  const base = 'min-h-[190px]';
  if (featured) return `${base} md:col-span-2 lg:row-span-2`;
  if (isLast) return `${base} md:col-span-2`;
  return base;
}

/**
 * ① 屏网格（懒加载，含 gsap 入场）。
 *
 * - 逐卡上浮入场，stagger 60ms，`once: true`（回滚不重播）。
 * - 空数组时显示空态文案 + GitHub 链接，而不是白屏。
 * - 最后一格是「更多项目 → GitHub」CTA，保证 Bento 布局在只有 3 条真实数据时仍然完整。
 */
export function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-[18px] border border-line bg-surface/70 p-10 text-center">
        <p className="font-display text-lg text-text">项目整理中</p>
        <p className="mt-2 text-sm text-muted">
          正在把仓库整理成可以看的样子，先去 GitHub 逛逛。
        </p>
        <a
          href={MORE_PROJECTS.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${MORE_PROJECTS.label}（在新标签打开）`}
          className="hp-btn hp-btn--ghost mt-6"
        >
          {MORE_PROJECTS.label}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    );
  }

  const cells = projects.map((project, index) => (
    <div
      key={project.slug}
      className={cellClass(index, projects.length + 1, Boolean(project.featured))}
    >
      <ProjectCard project={project} featured={Boolean(project.featured)} />
    </div>
  ));

  return (
    <AnimatedContent
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4"
      distance={24}
      direction="vertical"
      duration={0.55}
      ease="power2.out"
      stagger={0.06}
      threshold={0.05}
      once
    >
      {cells}

      {/* CTA 格：没有第 4~6 个真实项目时，用它保持 Bento 密度 */}
      <div className="md:col-span-2">
        <a
          href={MORE_PROJECTS.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${MORE_PROJECTS.label}（在新标签打开）`}
          className={[
            'group flex h-full min-h-[190px] flex-col justify-between rounded-[18px]',
            'border border-dashed border-line-strong bg-white/[0.015] p-6',
            'transition-[border-color,background-color,transform] duration-[200ms] ease-brand',
            'hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.03]',
          ].join(' ')}
        >
          <span className="hp-eyebrow">Index</span>
          <div>
            <p className="font-display text-lg font-semibold text-text">
              {MORE_PROJECTS.label}
              <span
                aria-hidden="true"
                className="ml-2 inline-block text-accent transition-transform duration-[200ms] ease-brand group-hover:translate-x-1"
              >
                →
              </span>
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{MORE_PROJECTS.hint}</p>
          </div>
        </a>
      </div>
    </AnimatedContent>
  );
}

export default ProjectsGrid;
