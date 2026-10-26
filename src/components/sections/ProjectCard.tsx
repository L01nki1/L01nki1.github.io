import BorderGlow from '@/components/bits/BorderGlow';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Project } from '@/content/types';

export interface ProjectCardProps {
  project: Project;
  /** featured 卡占 Bento 大格，排版更宽松。 */
  featured?: boolean;
}

/**
 * 项目卡：BorderGlow 鼠标跟随辉光 + hover 抬升 2px + 整卡新标签跳外链。
 * `href` 为空时不渲染箭头且不可点（P0-04 错误态）。
 */
export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const hasHref = project.href.trim().length > 0;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
          {project.year}
        </span>
        <StatusBadge status={project.status} />
      </div>

      <div className={featured ? 'mt-6' : 'mt-5'}>
        <h3
          className={[
            'font-display font-semibold text-text',
            featured ? 'text-2xl md:text-3xl' : 'text-lg',
          ].join(' ')}
        >
          {project.title}
        </h3>
        <p
          className={[
            'mt-2 text-muted',
            featured ? 'max-w-[34ch] text-sm md:text-base' : 'text-[13px] leading-relaxed',
          ].join(' ')}
        >
          {project.oneLiner}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <ul className="flex flex-wrap gap-1.5">
          {project.stack.map(tech => (
            <li key={tech} className="hp-pill">
              {tech}
            </li>
          ))}
        </ul>

        {hasHref ? (
          <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
            打开
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-[200ms] ease-brand group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        ) : null}
      </div>
    </>
  );

  const shellClass = [
    'group flex h-full w-full flex-col rounded-[18px] text-left',
    featured ? 'p-6 md:p-8' : 'p-5 md:p-6',
  ].join(' ');

  return (
    <div className="h-full transition-transform duration-[200ms] ease-brand hover:-translate-y-0.5">
      <BorderGlow
        className="h-full"
        backgroundColor="#0E1013"
        borderRadius={18}
        glowColor="186 78 64"
        glowIntensity={0.9}
        glowRadius={22}
        edgeSensitivity={28}
        coneSpread={24}
        colors={['#54E6F0', '#715ED1', '#54E6F0']}
        fillOpacity={0.4}
      >
        {hasHref ? (
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title}（在新标签打开）`}
            className={shellClass}
          >
            {body}
          </a>
        ) : (
          <div className={shellClass} aria-disabled="true">
            {body}
          </div>
        )}
      </BorderGlow>
    </div>
  );
}

export default ProjectCard;
