import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface InViewProps {
  children: ReactNode;
  /** 提前多少像素开始挂载，默认 '300px'。 */
  rootMargin?: string;
  /** 默认 0。 */
  threshold?: number;
  /** 滚出视口后是否卸载子节点（Hero 的字母场、SideRays 传 true）。 */
  unmountOnExit?: boolean;
  /** 未挂载时的占位高度，防止 CLS。 */
  minHeight?: number | string;
  className?: string;
}

/**
 * 视口挂载 / 卸载原语。
 *
 * 外层 div 永远是 IntersectionObserver 的观察目标（即使子节点被卸载也不能移除它），
 * 子节点是否渲染由状态决定，这样 Canvas/WebGL 组件滚出视口后能从 DOM 里真正消失。
 */
export function InView({
  children,
  rootMargin = '300px',
  threshold = 0,
  unmountOnExit = false,
  minHeight,
  className,
}: InViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState<boolean>(false);
  /** 非卸载模式下一次进入即永久保留（避免回滚时重新播放动画）。 */
  const [entered, setEntered] = useState<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      setEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.some(entry => entry.isIntersecting);
        setInView(visible);
        if (visible) setEntered(true);
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const show = unmountOnExit ? inView : entered;
  const style: CSSProperties | undefined =
    show || minHeight === undefined ? undefined : { minHeight };

  return (
    <div ref={ref} className={className} style={style}>
      {show ? children : null}
    </div>
  );
}

export default InView;
