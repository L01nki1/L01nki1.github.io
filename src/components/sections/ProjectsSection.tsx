import InView from '@/components/ui/InView';
import LazyReveal from '@/components/ui/LazyReveal';
import { PROJECTS } from '@/content/projects';

/** 懒加载：网格内含 gsap（AnimatedContent）+ BorderGlow，不能进首屏 chunk。
 *  用 LazyReveal 而非 lazy+Suspense —— Suspense 揭示会激活外层 page 转场（见 LazyReveal 注释）。 */
const loadProjectsGrid = () =>
  import('@/components/sections/ProjectsGrid').then(module => module.ProjectsGrid);

/** 网格占位：与真实网格同高，避免懒加载造成的 CLS。 */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4" aria-hidden="true">
      <div className="min-h-[190px] rounded-[18px] border border-line bg-surface/50 md:col-span-2 lg:row-span-2" />
      <div className="min-h-[190px] rounded-[18px] border border-line bg-surface/50" />
      <div className="min-h-[190px] rounded-[18px] border border-line bg-surface/50" />
      <div className="min-h-[190px] rounded-[18px] border border-line bg-surface/50 md:col-span-2" />
    </div>
  );
}

/** ① 屏副文案：数量由 `PROJECTS.length` 派生，不写死；0 条时换成空态说明。 */
const PROJECTS_INTRO =
  PROJECTS.length > 0
    ? `${PROJECTS.length} 个在维护的仓库，覆盖索引站、课程项目和一个玩笑。点卡片直接去线上地址。`
    : '仓库还在整理中，先看 GitHub。';

/**
 * ① 屏壳：标题 + 懒加载网格。
 *
 * 壳本身是静态的（首屏 chunk），只有网格及其 gsap 依赖走懒 chunk；
 * `InView` 用 400px rootMargin 提前预取，滚动到位时通常已经加载完。
 */
export function ProjectsSection() {
  return (
    <section id="projects" className="sec-projects hp-screen scroll-mt-24">
      <div className="hp-container relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="hp-eyebrow">01 — Selected work</p>
            <h2 className="mt-3 font-display text-h2 font-semibold text-text">
              做的一些小项目
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">{PROJECTS_INTRO}</p>
        </div>

        <div className="mt-10">
          <InView rootMargin="400px" minHeight={420}>
            <LazyReveal load={loadProjectsGrid} fallback={<GridSkeleton />}>
              {ProjectsGrid => <ProjectsGrid projects={PROJECTS} />}
            </LazyReveal>
          </InView>
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
