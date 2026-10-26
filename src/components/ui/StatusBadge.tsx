import type { ProjectStatus } from '@/content/types';

const LABELS: Record<ProjectStatus, string> = {
  shipped: '已上线',
  wip: '进行中',
  archived: '已归档',
};

/** 只用两个强调色：shipped→冰青，wip→紫罗兰，archived→灰。 */
const TONES: Record<ProjectStatus, string> = {
  shipped: 'border-accent/40 text-accent',
  wip: 'border-accent-2/45 text-accent-2',
  archived: 'border-line-strong text-faint',
};

export interface StatusBadgeProps {
  status?: ProjectStatus;
  className?: string;
}

/** 项目状态徽标；`status` 缺省时不渲染任何节点（P0-04）。 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px]',
        'font-mono text-[10px] tracking-[0.12em] whitespace-nowrap uppercase',
        TONES[status],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}

export default StatusBadge;
