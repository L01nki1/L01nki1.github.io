export interface MediaPlaceholderProps {
  /** 角标文案，缺省显示 `NO IMAGE`。 */
  label?: string;
  /** 图片 alt（占位时仅用于无障碍语义，缺省视为装饰性）。 */
  alt?: string;
  className?: string;
}

/**
 * 缺图兜底：固定比例灰块 + 图标 + mono 角标。
 *
 * 底色用 `#14171B`（elevated）而不是更深的 surface —— 太暗会被当成破图。
 * 图标描边 `#2A2F36`，只比底色亮一档，够看出「这里是一张图」但不抢内容。
 * 绝不渲染 `<img>`，因此不会出现浏览器破图图标。比例由调用方通过 className 给出。
 */
export function MediaPlaceholder({ label = 'NO IMAGE', alt, className }: MediaPlaceholderProps) {
  return (
    <div
      className={['relative flex items-center justify-center overflow-hidden', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: '#14171B' }}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      <div aria-hidden="true" className="hp-grid-hair absolute inset-0 opacity-50" />

      <div className="relative flex flex-col items-center gap-2.5">
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2A2F36"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
          <circle cx="8.5" cy="10" r="1.4" />
          <path d="M3.5 16.5l4.2-4.2 3.1 3.1 2.6-2.6 4.6 4.6" />
        </svg>
        <span className="font-mono text-[10px] tracking-[0.28em] text-faint uppercase">
          {label}
        </span>
      </div>

      <span
        aria-hidden="true"
        className="absolute top-0 left-0 h-3 w-3 border-t border-l border-line-strong"
      />
      <span
        aria-hidden="true"
        className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-line-strong"
      />
    </div>
  );
}

export default MediaPlaceholder;
